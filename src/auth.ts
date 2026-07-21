import crypto from "crypto";
import { Response } from "express";
import {
  OAuthServerProvider,
  AuthorizationParams,
} from "@modelcontextprotocol/sdk/server/auth/provider.js";
import { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import {
  OAuthClientInformationFull,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import {
  InvalidGrantError,
  InvalidTokenError,
} from "@modelcontextprotocol/sdk/server/auth/errors.js";

const AUTH_CODE_TTL_SECONDS = 10 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * A stateless OAuth 2.1 provider guarded by a single access password.
 *
 * Client registrations, authorization codes, and access tokens are all
 * HMAC-signed payloads rather than database rows, so the server needs no
 * storage and survives restarts/redeploys (important on hosts that spin
 * instances down). PKCE is validated by the SDK's token handler; codes are
 * single-flow by TTL rather than single-use, which PKCE makes safe against
 * interception replay.
 */
export class PasswordOAuthProvider implements OAuthServerProvider {
  private signingKey: Buffer;
  private passwordHash: Buffer;

  constructor(signingSecret: string, accessPassword: string) {
    if (signingSecret.length < 32) {
      throw new Error("OAUTH_SIGNING_SECRET must be at least 32 characters");
    }
    if (accessPassword.length < 12) {
      throw new Error("ACCESS_PASSWORD must be at least 12 characters");
    }
    this.signingKey = crypto
      .createHash("sha256")
      .update(signingSecret)
      .digest();
    this.passwordHash = crypto
      .createHash("sha256")
      .update(accessPassword)
      .digest();
  }

  private sign(payload: Record<string, unknown>): string {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const mac = crypto
      .createHmac("sha256", this.signingKey)
      .update(body)
      .digest()
      .toString("base64url");
    return `${body}.${mac}`;
  }

  private open(token: string, kind: string): Record<string, any> | undefined {
    const parts = token.split(".");
    if (parts.length !== 2) return undefined;
    const [body, mac] = parts;
    const expected = crypto
      .createHmac("sha256", this.signingKey)
      .update(body)
      .digest();
    let given: Buffer;
    try {
      given = Buffer.from(mac, "base64url");
    } catch {
      return undefined;
    }
    if (
      given.length !== expected.length ||
      !crypto.timingSafeEqual(given, expected)
    ) {
      return undefined;
    }
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(Buffer.from(body, "base64url").toString());
    } catch {
      return undefined;
    }
    if (payload.t !== kind) return undefined;
    if (typeof payload.exp === "number" && payload.exp < Date.now() / 1000) {
      return undefined;
    }
    return payload;
  }

  checkPassword(password: string): boolean {
    const given = crypto.createHash("sha256").update(password).digest();
    return crypto.timingSafeEqual(given, this.passwordHash);
  }

  createAuthorizationCode(
    clientId: string,
    codeChallenge: string,
    redirectUri: string
  ): string {
    return this.sign({
      t: "code",
      cid: clientId,
      ch: codeChallenge,
      ru: redirectUri,
      exp: Math.floor(Date.now() / 1000) + AUTH_CODE_TTL_SECONDS,
    });
  }

  get clientsStore(): OAuthRegisteredClientsStore {
    return {
      getClient: (clientId: string) => {
        const payload = this.open(clientId, "client");
        if (!payload || !Array.isArray(payload.ru)) return undefined;
        return {
          client_id: clientId,
          redirect_uris: payload.ru,
          token_endpoint_auth_method: "none",
          grant_types: ["authorization_code"],
          response_types: ["code"],
          client_name: payload.n,
        };
      },
      registerClient: (client) => {
        // The client_id itself carries the registration (signed), so
        // registration needs no storage. Public client + PKCE only.
        const clientId = this.sign({
          t: "client",
          ru: client.redirect_uris,
          n: client.client_name,
          iat: Math.floor(Date.now() / 1000),
        });
        return {
          ...client,
          client_id: clientId,
          client_secret: undefined,
          client_secret_expires_at: undefined,
          token_endpoint_auth_method: "none",
          grant_types: ["authorization_code"],
          response_types: ["code"],
        };
      },
    };
  }

  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response
  ): Promise<void> {
    res
      .status(200)
      .type("html")
      .send(
        renderLoginPage({
          clientId: client.client_id,
          clientName: client.client_name,
          redirectUri: params.redirectUri,
          codeChallenge: params.codeChallenge,
          state: params.state,
        })
      );
  }

  async challengeForAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string
  ): Promise<string> {
    const payload = this.open(authorizationCode, "code");
    if (!payload || payload.cid !== client.client_id) {
      throw new InvalidGrantError("Invalid or expired authorization code");
    }
    return payload.ch;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    _codeVerifier?: string,
    redirectUri?: string
  ): Promise<OAuthTokens> {
    const payload = this.open(authorizationCode, "code");
    if (!payload || payload.cid !== client.client_id) {
      throw new InvalidGrantError("Invalid or expired authorization code");
    }
    if (redirectUri && redirectUri !== payload.ru) {
      throw new InvalidGrantError("redirect_uri does not match");
    }
    const exp = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS;
    return {
      access_token: this.sign({ t: "access", cid: client.client_id, exp }),
      token_type: "bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async exchangeRefreshToken(): Promise<OAuthTokens> {
    throw new InvalidGrantError(
      "Refresh tokens are not supported; re-authorize instead"
    );
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const payload = this.open(token, "access");
    if (!payload) {
      throw new InvalidTokenError("Invalid or expired access token");
    }
    return {
      token,
      clientId: payload.cid,
      scopes: [],
      expiresAt: payload.exp,
    };
  }
}

export function renderLoginPage(options: {
  clientId: string;
  clientName?: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
  error?: string;
}): string {
  const requester = escapeHtml(options.clientName || "An MCP client");
  const errorHtml = options.error
    ? `<p class="error">${escapeHtml(options.error)}</p>`
    : "";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mailchimp MCP — Sign in</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; display: flex; justify-content: center; padding-top: 10vh; background: #f5f5f4; color: #1c1917; }
  .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 2rem; max-width: 22rem; width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  h1 { font-size: 1.1rem; margin: 0 0 .5rem; }
  p { font-size: .9rem; color: #57534e; margin: 0 0 1.25rem; }
  input[type=password] { width: 100%; box-sizing: border-box; padding: .6rem .7rem; border: 1px solid #d6d3d1; border-radius: 8px; font-size: 1rem; margin-bottom: 1rem; }
  button { width: 100%; padding: .6rem; border: 0; border-radius: 8px; background: #1c1917; color: #fff; font-size: 1rem; cursor: pointer; }
  .error { color: #b91c1c; }
</style>
</head>
<body>
<div class="card">
  <h1>Mailchimp MCP Server</h1>
  <p>${requester} is requesting access to the Mailchimp tools. Enter the access password to approve.</p>
  ${errorHtml}
  <form method="post" action="/login">
    <input type="hidden" name="client_id" value="${escapeHtml(options.clientId)}">
    <input type="hidden" name="redirect_uri" value="${escapeHtml(options.redirectUri)}">
    <input type="hidden" name="code_challenge" value="${escapeHtml(options.codeChallenge)}">
    <input type="hidden" name="state" value="${escapeHtml(options.state ?? "")}">
    <input type="password" name="password" placeholder="Access password" autofocus required>
    <button type="submit">Approve access</button>
  </form>
</div>
</body>
</html>`;
}
