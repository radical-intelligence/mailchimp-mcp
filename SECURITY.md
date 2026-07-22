# Security

## Reporting a vulnerability

Please report vulnerabilities privately via [GitHub security advisories](https://github.com/radical-intelligence/mailchimp-mcp/security/advisories/new) rather than public issues.

## Model

This server fronts a Mailchimp account that can read subscriber PII and send email to real audiences. Treat every credential accordingly.

| Credential | Lives in | If it leaks |
| --- | --- | --- |
| `MAILCHIMP_API_KEY` | User env (stdio) / Cloudflare secret (worker) | Revoke the key in Mailchimp (**Account & billing → Extras → API keys**) and issue a new one |
| `ACCESS_PASSWORD` | Cloudflare secret | Set a new one (`wrangler secret put ACCESS_PASSWORD`); existing tokens keep working until expiry, so also rotate the signing secret if you need to cut access now |
| `OAUTH_SIGNING_SECRET` | Cloudflare secret | Rotate it — this instantly invalidates **all** client registrations, codes, and access tokens |

## Design notes

- The remote server requires OAuth on every `/mcp` request; there is no unauthenticated tool access. Connections are gated by the access password, and access tokens expire after 30 days with no refresh path.
- Tokens are stateless HMAC-signed payloads. There is no token database to breach; the signing secret is the single revocation lever.
- Authorization codes are single-flow by TTL (10 minutes) rather than single-use; PKCE (S256, enforced) prevents an intercepted code from being redeemed without the verifier.
- Wrong-password attempts are delayed 1s to slow brute-forcing. Choose a long `ACCESS_PASSWORD` — it is the only thing between the internet and connecting a new client.
- The committed `dist/index.js` bundle and all source contain no secrets; keys are read from the environment at runtime.
- `send_campaign` is irreversible by nature; it requires `confirm: true` so an MCP client cannot trigger it without deliberate intent.
