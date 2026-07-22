/**
 * Cloudflare Workers entry point: remote MCP server (Streamable HTTP,
 * stateless) behind a password-gated OAuth 2.1 flow, for use as a claude.ai
 * custom connector. Requires the nodejs_compat compatibility flag.
 *
 * Secrets (wrangler secret put): MAILCHIMP_API_KEY, ACCESS_PASSWORD,
 * OAUTH_SIGNING_SECRET. The issuer URL is derived from each request, so no
 * BASE_URL configuration is needed.
 */
import { MailchimpService } from "./services/mailchimp.js";
import { getToolDefinitions, handleToolCall } from "./tools/index.js";
import { TokenService, renderLoginPage } from "./tokens.js";

interface Env {
  MAILCHIMP_API_KEY: string;
  ACCESS_PASSWORD: string;
  OAUTH_SIGNING_SECRET: string;
}

const SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
];
const SERVER_INFO = { name: "mailchimp-mcp-server", version: "2.2.0" };

function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function oauthError(
  error: string,
  description: string,
  status = 400
): Response {
  return json({ error, error_description: description }, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      console.error("Unhandled error:", error);
      return json({ error: "server_error" }, 500);
    }
  },
};

async function route(request: Request, env: Env): Promise<Response> {
  for (const name of [
    "MAILCHIMP_API_KEY",
    "ACCESS_PASSWORD",
    "OAUTH_SIGNING_SECRET",
  ] as const) {
    if (!env[name]) {
      return json({ error: `${name} secret is not configured` }, 500);
    }
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const tokens = new TokenService(
    env.OAUTH_SIGNING_SECRET,
    env.ACCESS_PASSWORD
  );

  // OAuth discovery metadata (claude.ai may request path-suffixed variants)
  if (url.pathname.startsWith("/.well-known/oauth-authorization-server")) {
    return json({
      issuer: origin,
      authorization_endpoint: `${origin}/authorize`,
      token_endpoint: `${origin}/token`,
      registration_endpoint: `${origin}/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      scopes_supported: [],
    });
  }
  if (url.pathname.startsWith("/.well-known/oauth-protected-resource")) {
    return json({
      resource: `${origin}/mcp`,
      resource_name: "Mailchimp MCP Server",
      authorization_servers: [origin],
      bearer_methods_supported: ["header"],
    });
  }

  if (url.pathname === "/register" && request.method === "POST") {
    return handleRegister(request, tokens);
  }
  if (url.pathname === "/authorize" && request.method === "GET") {
    return handleAuthorize(url, tokens);
  }
  if (url.pathname === "/login" && request.method === "POST") {
    return handleLogin(request, tokens);
  }
  if (url.pathname === "/token" && request.method === "POST") {
    return handleToken(request, tokens);
  }
  if (url.pathname === "/mcp") {
    if (request.method !== "POST") {
      // Stateless: no SSE stream or session to resume/terminate
      return json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: "Method not allowed" },
          id: null,
        },
        405
      );
    }
    return handleMcp(request, env, tokens, origin);
  }

  if (url.pathname === "/" && request.method === "GET") {
    return json({
      name: "Mailchimp MCP Server",
      status: "ok",
      endpoint: "/mcp",
    });
  }

  return json({ error: "not_found" }, 404);
}

// --- OAuth endpoints ---------------------------------------------------

async function handleRegister(
  request: Request,
  tokens: TokenService
): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return oauthError("invalid_client_metadata", "Request body must be JSON");
  }
  const redirectUris = body?.redirect_uris;
  if (
    !Array.isArray(redirectUris) ||
    redirectUris.length === 0 ||
    !redirectUris.every(
      (u: unknown) => typeof u === "string" && /^https?:\/\//.test(u)
    )
  ) {
    return oauthError(
      "invalid_client_metadata",
      "redirect_uris must be a non-empty array of http(s) URLs"
    );
  }
  const clientName =
    typeof body.client_name === "string" ? body.client_name : undefined;
  // Public client + PKCE only; the signed client_id carries the whole
  // registration, so nothing is stored
  const clientId = tokens.createClientId(redirectUris, clientName);
  return json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      client_name: clientName,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
    },
    201
  );
}

function handleAuthorize(url: URL, tokens: TokenService): Response {
  const clientId = url.searchParams.get("client_id") ?? "";
  const redirectUri = url.searchParams.get("redirect_uri") ?? "";
  const responseType = url.searchParams.get("response_type");
  const codeChallenge = url.searchParams.get("code_challenge") ?? "";
  const challengeMethod =
    url.searchParams.get("code_challenge_method") ?? "S256";
  const state = url.searchParams.get("state") ?? undefined;

  const client = tokens.getClient(clientId);
  if (!client || !client.redirectUris.includes(redirectUri)) {
    return html("Unknown client or redirect URI", 400);
  }
  if (responseType !== "code" || !codeChallenge || challengeMethod !== "S256") {
    const redirect = new URL(redirectUri);
    redirect.searchParams.set("error", "invalid_request");
    redirect.searchParams.set(
      "error_description",
      "response_type=code and S256 PKCE are required"
    );
    if (state) redirect.searchParams.set("state", state);
    return Response.redirect(redirect.toString(), 302);
  }

  return html(
    renderLoginPage({
      clientId,
      clientName: client.clientName,
      redirectUri,
      codeChallenge,
      state,
    })
  );
}

async function handleLogin(
  request: Request,
  tokens: TokenService
): Promise<Response> {
  const form = await request.formData();
  const field = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  const clientId = field("client_id");
  const redirectUri = field("redirect_uri");
  const codeChallenge = field("code_challenge");
  const state = field("state") || undefined;
  const password = field("password");

  if (!clientId || !redirectUri || !codeChallenge) {
    return html("Missing required parameters", 400);
  }
  const client = tokens.getClient(clientId);
  if (!client || !client.redirectUris.includes(redirectUri)) {
    return html("Unknown client or redirect URI", 400);
  }

  if (!password || !tokens.checkPassword(password)) {
    // Slow down brute-force attempts
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return html(
      renderLoginPage({
        clientId,
        clientName: client.clientName,
        redirectUri,
        codeChallenge,
        state,
        error: "Incorrect password. Try again.",
      }),
      401
    );
  }

  const code = tokens.createAuthorizationCode(
    clientId,
    codeChallenge,
    redirectUri
  );
  const redirect = new URL(redirectUri);
  redirect.searchParams.set("code", code);
  if (state) redirect.searchParams.set("state", state);
  return Response.redirect(redirect.toString(), 302);
}

async function handleToken(
  request: Request,
  tokens: TokenService
): Promise<Response> {
  const form = await request.formData();
  const field = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  const grantType = field("grant_type");

  if (grantType === "refresh_token") {
    return oauthError(
      "invalid_grant",
      "Refresh tokens are not supported; re-authorize instead"
    );
  }
  if (grantType !== "authorization_code") {
    return oauthError(
      "unsupported_grant_type",
      "Only authorization_code is supported"
    );
  }

  const clientId = field("client_id");
  const code = field("code");
  const codeVerifier = field("code_verifier");
  if (!clientId || !code || !codeVerifier) {
    return oauthError(
      "invalid_request",
      "client_id, code, and code_verifier are required"
    );
  }
  if (!tokens.getClient(clientId)) {
    return oauthError("invalid_client", "Unknown client", 401);
  }

  const result = tokens.redeemAuthorizationCode(
    code,
    clientId,
    codeVerifier,
    field("redirect_uri") || undefined
  );
  if ("error" in result) {
    return oauthError("invalid_grant", result.error);
  }
  return json({
    access_token: result.accessToken,
    token_type: "bearer",
    expires_in: result.expiresIn,
  });
}

// --- MCP endpoint (Streamable HTTP, stateless) --------------------------

async function handleMcp(
  request: Request,
  env: Env,
  tokens: TokenService,
  origin: string
): Promise<Response> {
  const unauthorized = (description: string) =>
    json(
      { error: "invalid_token", error_description: description },
      401,
      {
        "WWW-Authenticate": `Bearer error="invalid_token", resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
      }
    );

  const authHeader = request.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return unauthorized("Missing bearer token");
  if (!tokens.verifyAccessToken(match[1])) {
    return unauthorized("Invalid or expired access token");
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      },
      400
    );
  }

  const service = new MailchimpService(env.MAILCHIMP_API_KEY);
  const messages = Array.isArray(body) ? body : [body];
  const responses: unknown[] = [];
  for (const message of messages) {
    // Notifications and responses get no reply
    if (message?.id === undefined || message?.id === null) continue;
    if (message?.method === undefined) continue;
    responses.push(await handleRpc(message, service));
  }

  if (responses.length === 0) {
    return new Response(null, { status: 202 });
  }
  return json(responses.length === 1 ? responses[0] : responses);
}

async function handleRpc(message: any, service: MailchimpService) {
  const { id, method, params } = message;
  const result = (value: unknown) => ({ jsonrpc: "2.0", id, result: value });
  const error = (code: number, msg: string) => ({
    jsonrpc: "2.0",
    id,
    error: { code, message: msg },
  });

  try {
    switch (method) {
      case "initialize": {
        const requested = params?.protocolVersion;
        return result({
          protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
            ? requested
            : SUPPORTED_PROTOCOL_VERSIONS[1],
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });
      }
      case "ping":
        return result({});
      case "tools/list":
        return result({ tools: getToolDefinitions(service) });
      case "tools/call":
        try {
          return result(
            await handleToolCall(service, params?.name, params?.arguments)
          );
        } catch (toolError: any) {
          // Tool failures are results with isError, not protocol errors
          return result({
            content: [
              {
                type: "text",
                text: toolError?.message ?? "Tool execution failed",
              },
            ],
            isError: true,
          });
        }
      default:
        return error(-32601, `Method not found: ${method}`);
    }
  } catch (err: any) {
    return error(-32603, err?.message ?? "Internal error");
  }
}
