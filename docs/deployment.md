# Deploying the Remote Server (Cloudflare Workers)

The remote server makes this repo usable as a [claude.ai custom connector](claude-ai-connector.md). It runs on [Cloudflare Workers](https://workers.cloudflare.com/) — the free tier is enough (100k requests/day, no cold-start spin-downs, no credit card).

## One-time deploy (~5 minutes)

```bash
npm install
npx wrangler login                              # opens browser; free Cloudflare account
npx wrangler secret put MAILCHIMP_API_KEY       # Mailchimp key with data center suffix
npx wrangler secret put ACCESS_PASSWORD         # password that gates connections (min 12 chars)
npx wrangler secret put OAUTH_SIGNING_SECRET    # random string, min 32 chars — keep it stable
npm run deploy
```

`wrangler deploy` prints the URL, e.g. `https://mailchimp-mcp.<your-subdomain>.workers.dev`. The connector endpoint is that URL plus `/mcp`.

Give a couple of minutes for the first deploy to propagate before connecting from claude.ai.

## Secrets

| Secret | Purpose |
| --- | --- |
| `MAILCHIMP_API_KEY` | Mailchimp API key (with data center suffix, e.g. `…-us1`) |
| `ACCESS_PASSWORD` | What users type to authorize a connection |
| `OAUTH_SIGNING_SECRET` | Signs all OAuth tokens. Keep it stable across deploys; rotating it instantly revokes every existing connection |

No `BASE_URL` is needed — the worker derives its public URL from each request.

## Local development

Copy real or dummy values into `.dev.vars` (gitignored) and run `npm run dev` for a local instance at `http://localhost:8787`. Note: with real values, local write tools talk to your real Mailchimp account.

```
MAILCHIMP_API_KEY=...
ACCESS_PASSWORD=...
OAUTH_SIGNING_SECRET=...
```

## Architecture

- **Transport**: Streamable HTTP at `POST /mcp`, stateless — each request is handled independently; no sessions, no SSE stream.
- **Auth**: OAuth 2.1 with dynamic client registration and PKCE, gated by the single access password. Every `/mcp` request requires a valid bearer token; tokens expire after 30 days (no refresh tokens — clients re-authorize).
- **No storage**: client registrations, authorization codes, and access tokens are HMAC-signed payloads (signed with `OAUTH_SIGNING_SECRET`), not database rows. Redeploys don't invalidate connections, and there is no KV/Durable Object dependency.
- **Shared core**: the worker (`src/worker.ts`) and the stdio server (`src/index.ts`) both expose the identical tool set from `src/tools/`.

See [SECURITY.md](../SECURITY.md) for the threat model and what to do if a credential leaks.
