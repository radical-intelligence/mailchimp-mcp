#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { MailchimpService } from "./services/mailchimp.js";
import { createMcpServer } from "./server.js";
import { PasswordOAuthProvider, renderLoginPage } from "./auth.js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} environment variable is required`);
    process.exit(1);
  }
  return value;
}

const MAILCHIMP_API_KEY = requiredEnv("MAILCHIMP_API_KEY");
const ACCESS_PASSWORD = requiredEnv("ACCESS_PASSWORD");
const OAUTH_SIGNING_SECRET = requiredEnv("OAUTH_SIGNING_SECRET");
const BASE_URL = requiredEnv("BASE_URL").replace(/\/$/, "");
const PORT = parseInt(process.env.PORT || "3000", 10);

const mailchimpService = new MailchimpService(MAILCHIMP_API_KEY);
const provider = new PasswordOAuthProvider(
  OAUTH_SIGNING_SECRET,
  ACCESS_PASSWORD
);

const app = express();
// Exactly one proxy hop (the platform load balancer on Render/Fly/Railway);
// `true` would let clients spoof X-Forwarded-For and bypass rate limiting
app.set("trust proxy", 1);

// OAuth endpoints: /.well-known metadata, /authorize, /token, /register.
// The SDK router rate-limits these by default.
app.use(
  mcpAuthRouter({
    provider,
    issuerUrl: new URL(BASE_URL),
    resourceServerUrl: new URL(`${BASE_URL}/mcp`),
    resourceName: "Mailchimp MCP Server",
  })
);

// Password form submission from the /authorize page
app.post(
  "/login",
  express.urlencoded({ extended: false }),
  async (req, res) => {
    const { password, client_id, redirect_uri, code_challenge, state } =
      req.body as Record<string, string | undefined>;

    if (!client_id || !redirect_uri || !code_challenge) {
      res.status(400).send("Missing required parameters");
      return;
    }
    const client = await provider.clientsStore.getClient(client_id);
    if (!client || !client.redirect_uris.includes(redirect_uri)) {
      res.status(400).send("Unknown client or redirect URI");
      return;
    }

    if (!password || !provider.checkPassword(password)) {
      // Slow down brute-force attempts
      await new Promise((resolve) => setTimeout(resolve, 1000));
      res
        .status(401)
        .type("html")
        .send(
          renderLoginPage({
            clientId: client_id,
            clientName: client.client_name,
            redirectUri: redirect_uri,
            codeChallenge: code_challenge,
            state,
            error: "Incorrect password. Try again.",
          })
        );
      return;
    }

    const code = provider.createAuthorizationCode(
      client_id,
      code_challenge,
      redirect_uri
    );
    const redirect = new URL(redirect_uri);
    redirect.searchParams.set("code", code);
    if (state) redirect.searchParams.set("state", state);
    res.redirect(redirect.toString());
  }
);

// MCP endpoint — stateless Streamable HTTP: a fresh server + transport pair
// per request, torn down when the response closes
const bearerAuth = requireBearerAuth({
  verifier: provider,
  resourceMetadataUrl: `${BASE_URL}/.well-known/oauth-protected-resource`,
});

app.post("/mcp", bearerAuth, express.json(), async (req, res) => {
  const server = createMcpServer(mailchimpService);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// Stateless transport: no SSE stream or session to resume/terminate
const methodNotAllowed = (_req: express.Request, res: express.Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed" },
    id: null,
  });
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.get("/", (_req, res) => {
  res.json({ name: "Mailchimp MCP Server", status: "ok", endpoint: "/mcp" });
});

app.listen(PORT, () => {
  console.log(`Mailchimp MCP server listening on port ${PORT}`);
  console.log(`Connector URL: ${BASE_URL}/mcp`);
});
