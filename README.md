# Fertilizer Program — Vercel deploy

Standard Vercel layout: each file in /api is its own serverless function
(auto-detected, no vercel.json needed).

## Files (these must be at the REPO ROOT — not inside a subfolder)
  index.html
  api/plans.js
  api/pay.js
  api/callback.js
  api/status.js
  lib/plans.js
  lib/store.js
  package.json

## Deploy
1. Put these files at the top level of a GitHub repo (index.html at the root).
2. Vercel -> Add New -> Project -> import the repo -> Framework: Other -> Deploy.
3. Settings -> Environment Variables (Production):
   PAYHERO_AUTH            = Basic <your token>
   PAYHERO_CHANNEL_ID      = <your channel id>
   PAYHERO_CALLBACK_URL    = https://<your-project>.vercel.app/api/callback
   UPSTASH_REDIS_REST_URL  = <from Upstash>
   UPSTASH_REDIS_REST_TOKEN= <from Upstash>
4. Redeploy (Deployments -> ... -> Redeploy) so the variables load.

## Test
  https://<your-project>.vercel.app/           -> the page
  https://<your-project>.vercel.app/api/plans  -> {"plans":[...
