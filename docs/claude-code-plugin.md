# Claude Code Plugin

Installs the server into [Claude Code](https://claude.com/claude-code) with two commands — no build step, the repo ships a ready-to-run bundle (`dist/index.js`).

## Install

```
/plugin marketplace add radical-intelligence/mailchimp-mcp
/plugin install mailchimp@radical-intelligence
```

## Configure

Make your Mailchimp API key available in your environment (e.g. in `~/.zshrc`):

```bash
export MAILCHIMP_API_KEY=your-api-key-here-us1
```

The key must include the data center suffix (e.g. `xxxxxxxxxxxxxxxx-us1`). Create one in Mailchimp under **Account & billing → Extras → API keys**.

Restart Claude Code after setting the variable. All tools from the [tool reference](tools.md) are then available in your sessions.

## How it works

The plugin manifest (`.claude-plugin/plugin.json`) points Claude Code at `.mcp.json`, which launches the bundled stdio server with `node`. The API key is read from your environment at runtime — it is never stored in the plugin or the repo.
