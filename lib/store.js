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

// Drop expired entries so the in-memory Map doesn't grow forever.
function sweep() {
  const now = Date.now();
  for (const [key, entry] of mem) {
    if (entry.expiresAt && entry.expiresAt <= now) mem.delete(key);
  }
}

async function setStatus(reference, value, ttlSeconds) {
  const ttl = ttlSeconds || 1800;
  const r = getRedis();
  if (r) {
    await r.set("pay:" + reference, value, { ex: ttl });
  } else {
    mem.set(reference, { value: value, expiresAt: Date.now() + ttl * 1000 });
    if (mem.size > 500) sweep(); // cheap periodic cleanup
  }
}

async function getStatus(reference) {
  const r = getRedis();
  if (r) {
    return await r.get("pay:" + reference);
  }
  const entry = mem.get(reference);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    mem.delete(reference); // lazy expiry on read
    return null;
  }
  return entry.value;
}

module.exports = { setStatus, getStatus };
