# Mailchimp MCP Server

A Model Context Protocol (MCP) server for the Mailchimp Marketing API v3 — with **read and write** support. Read audiences, campaigns, templates and reports; create and update templates; create, edit, send and schedule campaigns.

Forked from [AgentX-ai/mailchimp-mcp](https://github.com/AgentX-ai/mailchimp-mcp) (read-only) and extended by [Radical Intelligence](https://radicalintelligence.ai) with write capabilities and Claude Code plugin packaging.

## Installation

### As a Claude Code plugin (recommended)

```
/plugin marketplace add radical-intelligence/mailchimp-mcp
/plugin install mailchimp@radical-intelligence
```

Then make your API key available in your environment (e.g. in `~/.zshrc`):

```bash
export MAILCHIMP_API_KEY=your-api-key-here-us1
```

### As a plain MCP server

Configure any MCP client to use:

```json
{
  "mcpServers": {
    "mailchimp": {
      "command": "node",
      "args": ["/path/to/mailchimp-mcp/dist/index.js"],
      "env": {
        "MAILCHIMP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Your Mailchimp API key must include the data center suffix (e.g. `xxxxxxxxxxxxxxxx-us1`). Create one in Mailchimp under **Account & billing → Extras → API keys**.

## Write capabilities

These tools modify your Mailchimp account. `send_campaign` sends real email and is guarded by a required `confirm: true` parameter — clients should always get explicit user approval first.

| Tool | What it does |
| --- | --- |
| `create_template` | Create a template from HTML (`POST /templates`) |
| `update_template` | Replace a template's name/HTML (`PATCH /templates/{id}`) |
| `create_campaign` | Create a **draft** campaign targeting an audience, optionally narrowed to a saved segment |
| `update_campaign_settings` | Edit a draft's subject line, preview text, title, from name, reply-to |
| `set_campaign_content` | Attach a template (or raw HTML) as the campaign content |
| `get_campaign_send_checklist` | Mailchimp's pre-send checklist for a campaign |
| `send_campaign` | Send immediately — irreversible, requires `confirm: true` |
| `schedule_campaign` | Schedule a future send (UTC, quarter-hour boundaries; paid Mailchimp plans only) |
| `unschedule_campaign` | Return a scheduled campaign to draft |

### Typical flow: send a template to an audience

Mailchimp doesn't send templates directly — a campaign carries the template to an audience:

1. `create_template` (or pick an existing one via `list_templates`)
2. `create_campaign` with `list_id` (and optionally `saved_segment_id`) — creates a draft
3. `set_campaign_content` with the `template_id`
4. `get_campaign_send_checklist` to verify it's ready
5. `send_campaign` (with explicit user approval) or `schedule_campaign`

### Notes and constraints

- Templates created via the API are **code-edit only** — they can't be opened in Mailchimp's drag-and-drop editor.
- `update_template` requires both `name` and `html`; the HTML fully replaces the existing markup.
- `schedule_campaign` times must be UTC ISO 8601 on a quarter-hour boundary (`:00`/`:15`/`:30`/`:45`) and scheduling requires a paid Mailchimp plan.

## Read capabilities

All read tools from the original server are included (list/get pairs unless noted):

- **Audiences & members**: lists, members, segments, merge fields
- **Campaigns**: campaigns, campaign content, recipients, folders
- **Templates**: templates
- **Automations** (classic automations only — automation *flows* aren't exposed by the Mailchimp API): automations, automation emails, subscriber queues
- **Reports & analytics**: campaign reports, automation reports, subscriber activity
- **Account**: account info and statistics
- **File manager**: files
- **Landing pages**: landing pages
- **E-commerce**: stores, products, orders
- **Conversations**: conversations

## Development

```bash
npm install
npm run build     # compile TypeScript to build/
npm run bundle    # bundle to dist/index.js (single file, committed for plugin use)
npm run inspector # test with the MCP inspector
```

`dist/index.js` is a bundled build artifact committed to the repo so the Claude Code plugin can run without an install/build step. It contains code only — the API key is always read from the environment at runtime and never stored in the repo. Rebuild it (`npm run bundle`) after changing anything in `src/`.

## API Reference

Built on the [Mailchimp Marketing API v3](https://mailchimp.com/developer/marketing/api/).

## License

MIT
