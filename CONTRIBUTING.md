# Contributing

## Development setup

```bash
git clone https://github.com/radical-intelligence/mailchimp-mcp.git
cd mailchimp-mcp
npm install
```

## Scripts

```bash
npm run build     # compile TypeScript to build/
npm run bundle    # bundle the stdio server to dist/index.js
npm run dev       # run the Cloudflare Worker locally (secrets from .dev.vars)
npm run deploy    # deploy the worker to Cloudflare
npm run inspector # exercise the stdio server with the MCP inspector
```

## Project layout

```
src/
  index.ts             stdio entry point (Claude Code plugin / local MCP clients)
  worker.ts            Cloudflare Workers entry point (claude.ai custom connector)
  server.ts            shared MCP server factory (stdio path)
  tokens.ts            stateless OAuth token/login logic (node:crypto; runs on Node and workerd)
  tools/index.ts       tool definitions + dispatcher
  services/mailchimp.ts Mailchimp Marketing API v3 client
  types/index.ts       API response types
.claude-plugin/        Claude Code plugin + marketplace manifests
.mcp.json              plugin MCP server config
wrangler.jsonc         Cloudflare Workers config
dist/index.js          committed stdio bundle (see below)
```

## Rules of the repo

- **`dist/index.js` is a committed build artifact.** The Claude Code plugin runs it directly from a clone with no install step, so every change under `src/` must be followed by `npm run bundle`, with the updated bundle included in the same commit. It contains code only — never secrets.
- **Secrets never enter the repo.** API keys and passwords live in the environment (`MAILCHIMP_API_KEY`), Cloudflare secrets (`wrangler secret put`), or the gitignored `.dev.vars`.
- **Both transports must stay in sync.** The tool layer (`src/tools/`, `src/services/`) is transport-agnostic; don't add transport-specific behavior inside it.
- **Write tools ship with guardrails.** Anything irreversible (sending email) requires an explicit confirmation parameter and must say so in its tool description.

## Testing

There is no committed test suite yet. At minimum before a PR:

1. `npm run build` compiles clean.
2. stdio smoke test: pipe an `initialize` + `tools/list` request into `node dist/index.js` with a dummy `MAILCHIMP_API_KEY` and confirm all tools are listed.
3. If you touched the worker or auth: run `npm run dev` and walk the OAuth flow (register → authorize → login → token → authenticated `/mcp` call), including a wrong password and a wrong PKCE verifier.

## Pull requests

Work on a branch, target `master`, and describe what changed and how you verified it. Keep unrelated changes out of the PR.
