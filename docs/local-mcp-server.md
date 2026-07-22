# Running as a Local MCP Server

For MCP clients other than Claude Code — the Claude desktop app, or any client that speaks stdio MCP. The repo ships a ready-to-run single-file bundle at `dist/index.js`; no install or build required beyond cloning.

## Claude desktop app

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mailchimp": {
      "command": "node",
      "args": ["/absolute/path/to/mailchimp-mcp/dist/index.js"],
      "env": {
        "MAILCHIMP_API_KEY": "your-api-key-here-us1"
      }
    }
  }
}
```

Restart the desktop app. Note: if you use the [claude.ai custom connector](claude-ai-connector.md), you don't need this — connectors added on claude.ai already work in the desktop app.

## Any other MCP client

Point the client at the same command:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/mailchimp-mcp/dist/index.js"],
  "env": { "MAILCHIMP_API_KEY": "your-api-key-here" }
}
```

The server speaks MCP over stdio. The API key must include the data center suffix (e.g. `xxxxxxxxxxxxxxxx-us1`); create one in Mailchimp under **Account & billing → Extras → API keys**.
