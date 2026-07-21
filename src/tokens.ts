import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const AUTH_CODE_TTL_SECONDS = 10 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface ClientRecord {
  redirectUris: string[];
  clientName?: string;
}

/**
 * Stateless OAuth token machinery guarded by a single access password.
 *
 * Client registrations, authorization codes, and access tokens are all
 * HMAC-signed payloads rather than database rows, so the server needs no
 * storage and survives restarts/redeploys. PKCE protects authorization
 * codes against interception replay within their 10-minute TTL.
 *
 * Uses only node:crypto/node:buffer, which run both on Node and on
 * Cloudflare Workers with the nodejs_compat flag.
 */
export class TokenService {
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

  createClientId(redirectUris: string[], clientName?: string): string {
    return this.sign({
      t: "client",
      ru: redirectUris,
      n: clientName,
      iat: Math.floor(Date.now() / 1000),
    });
  }

  getClient(clientId: string): ClientRecord | undefined {
    const payload = this.open(clientId, "client");
    if (!payload || !Array.isArray(payload.ru)) return undefined;
    return { redirectUris: payload.ru, clientName: payload.n };
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

  /**
   * Validates an authorization code against the requesting client, PKCE
   * verifier, and redirect URI. Returns an access token, or undefined with
   * a reason if anything doesn't match.
   */
  redeemAuthorizationCode(
    code: string,
    clientId: string,
    codeVerifier: string,
    redirectUri?: string
  ): { accessToken: string; expiresIn: number } | { error: string } {
    const payload = this.open(code, "code");
    if (!payload || payload.cid !== clientId) {
      return { error: "Invalid or expired authorization code" };
    }
    if (redirectUri && redirectUri !== payload.ru) {
      return { error: "redirect_uri does not match" };
    }
    const challenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");
    if (challenge !== payload.ch) {
      return { error: "PKCE code_verifier does not match" };
    }
    const exp = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS;
    return {
      accessToken: this.sign({ t: "access", cid: clientId, exp }),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  verifyAccessToken(
    token: string
  ): { clientId: string; expiresAt: number } | undefined {
    const payload = this.open(token, "access");
    if (!payload) return undefined;
    return { clientId: payload.cid, expiresAt: payload.exp };
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
