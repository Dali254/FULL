/* Remembers payment status between the STK-push request, PayHero's callback,
   and the status check.

   - On a normal server (cPanel "Setup Node.js App", or `node app.js`) the app
     is one long-running process, so an in-memory store is enough — no database.
   - On serverless (Vercel) functions don't share memory, so set the Upstash /
     Vercel KV env vars and this file will use Redis automatically instead. */

const mem = new Map();

let client = null;
let tried = false;

function getRedis() {
  if (tried) return client;
  tried = true;
  const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const { Redis } = require("@upstash/redis"); // loaded only when needed
      client = new Redis({ url: url, token: token });
    } catch (e) {
      client = null; // fall back to memory if the package isn't installed
    }
  }
  return client;
}

async function setStatus(reference, value, ttlSeconds) {
  const r = getRedis();
  if (r) {
    await r.set("pay:" + reference, value, { ex: ttlSeconds || 1800 });
  } else {
    mem.set(reference, value);
  }
}

async function getStatus(reference) {
  const r = getRedis();
  if (r) {
    return await r.get("pay:" + reference);
  }
  return mem.get(reference) || null;
}

module.exports = { setStatus, getStatus };
