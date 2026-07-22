# Mailchimp MCP Server

A Model Context Protocol (MCP) server for the Mailchimp Marketing API v3 with **read and write** support: read audiences, campaigns, templates and reports; create and update templates; create, edit, send and schedule campaigns.

47 tools total — see the [tool reference](docs/tools.md).

## Ways to use it

| I want Mailchimp tools in… | Use | Guide |
| --- | --- | --- |
| Claude Code | Plugin (two commands, no build) | [Claude Code plugin](docs/claude-code-plugin.md) |
| claude.ai web, mobile, and desktop apps | Custom connector backed by a free Cloudflare Worker | [Deploy the server](docs/deployment.md), then [connect](docs/claude-ai-connector.md) |
| The Claude desktop app or another MCP client, locally | stdio server via the committed bundle | [Local MCP server](docs/local-mcp-server.md) |

## Quick start (Claude Code)

```
/plugin marketplace add radical-intelligence/mailchimp-mcp
/plugin install mailchimp@radical-intelligence
export MAILCHIMP_API_KEY=your-api-key-here-us1
```

## Documentation

- [Tool reference](docs/tools.md) — all 47 tools, the template→campaign→send flow, constraints
- [Claude Code plugin](docs/claude-code-plugin.md) — install and configure
- [Deployment](docs/deployment.md) — host the remote server on Cloudflare Workers (free tier)
- [claude.ai connector](docs/claude-ai-connector.md) — first-time setup for end users, troubleshooting
- [Local MCP server](docs/local-mcp-server.md) — Claude desktop app and other MCP clients
- [CONTRIBUTING](CONTRIBUTING.md) — development setup, project layout, repo rules
- [SECURITY](SECURITY.md) — credential handling, revocation, design notes

## License

MIT
