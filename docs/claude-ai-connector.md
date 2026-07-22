# Using the claude.ai Custom Connector

Once the server is [deployed](deployment.md), anyone you share the URL and access password with can connect it to their Claude account. A connector added once on claude.ai is available in the **web app, mobile apps, and desktop app**.

## Prerequisites

- A paid Claude plan (Pro, Max, Team, or Enterprise) — Anthropic gates custom connectors to paid plans. On Team/Enterprise an admin may need to enable custom connectors.
- The connector URL and access password from whoever operates the deployment.

## First-time setup

1. Open [claude.ai](https://claude.ai) → **Settings → Connectors → Add custom connector**
2. Enter the connector URL, e.g. `https://mailchimp-mcp.<subdomain>.workers.dev/mcp`
3. Leave **OAuth Client ID** and **Client Secret** blank — the server registers Claude automatically
4. Click **Add**, then **Connect** — a sign-in page opens
5. Enter the access password and approve

That's it. The Mailchimp tools now appear in Claude conversations on every device where you're signed in.

## Day-to-day notes

- Access lasts **30 days**, after which Claude asks you to re-enter the password.
- The connector only acts inside conversations you start — nothing runs in the background.
- Sending a campaign is irreversible; Claude is required to get your explicit confirmation before calling the send tool.

## Troubleshooting

- **"Couldn't register with sign-in service"** right after deploying: Cloudflare can take a couple of minutes to propagate a new worker. Wait, then remove and re-add the connector.
- Still failing? The operator can stream live requests with `npx wrangler tail` while you retry, and check the endpoints directly: `https://<worker-url>/` should return `{"status":"ok"}` and `https://<worker-url>/.well-known/oauth-authorization-server` should return JSON metadata.
