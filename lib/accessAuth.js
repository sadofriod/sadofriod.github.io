/**
 * Cloudflare Access gate for the admin surfaces (photo + podcast upload/manage).
 *
 * When ACCESS_TEAM_DOMAIN and ACCESS_AUD are configured, every write request has to
 * carry a `Cf-Access-Jwt-Assertion` header that Access injects after the visitor has
 * passed the identity provider. The header is verified against the team's published
 * signing keys, so a request that reaches the Worker directly cannot forge it.
 *
 * Without those two variables the Worker falls back to the legacy UPLOAD_AUTH_KEY, which
 * keeps deployments that have not enabled Access working.
 */

const CERTS_TTL_MS = 60 * 60 * 1000;
/** Plain JSON only — never hold a Response or a stream across requests. */
let certsCache = { fetchedAt: 0, keys: [] };

export function accessConfigured(env) {
  return Boolean(env && env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD);
}

function b64urlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeSegment(value) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(value)));
}

async function signingKeys(teamDomain) {
  const now = Date.now();
  if (certsCache.keys.length && now - certsCache.fetchedAt < CERTS_TTL_MS) return certsCache.keys;

  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!response.ok) throw new Error(`Access certs request failed: ${response.status}`);

  const body = await response.json();
  const keys = Array.isArray(body.keys) ? body.keys : [];
  if (!keys.length) throw new Error('Access certs response contained no keys');

  certsCache = { fetchedAt: now, keys };
  return keys;
}

/**
 * Verifies the JWT and returns its claims. Throws on any problem so callers can decide
 * whether an invalid token means "anonymous" or "misconfigured".
 */
export async function verifyAccessJwt(token, env) {
  if (typeof token !== 'string') throw new Error('missing token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed token');

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeSegment(headerPart);
  const payload = decodeSegment(payloadPart);

  if (header.alg !== 'RS256') throw new Error(`unexpected alg: ${header.alg}`);

  const keys = await signingKeys(env.ACCESS_TEAM_DOMAIN);
  // Match on kid strictly: during key rotation the old key keeps verifying old tokens,
  // and an unknown kid must not fall back to "whatever key is published".
  const jwk = keys.find((candidate) => candidate.kid === header.kid) || (!header.kid && keys.length === 1 ? keys[0] : null);
  if (!jwk) throw new Error('no matching signing key');

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(signaturePart),
    new TextEncoder().encode(`${headerPart}.${payloadPart}`)
  );
  if (!valid) throw new Error('signature mismatch');

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp <= now) throw new Error('token expired');
  if (typeof payload.nbf === 'number' && payload.nbf > now) throw new Error('token not yet valid');

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(env.ACCESS_AUD)) throw new Error('audience mismatch');

  return payload;
}

/**
 * Returns `{ email, sub }` for an authenticated request, or null when the request is not
 * authenticated. Misconfiguration (bad certs, wrong aud) also yields null — a protected
 * route must fail closed, and the Worker logs the reason.
 */
export async function accessIdentity(request, env) {
  if (!accessConfigured(env)) return null;
  const token = request && request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;

  try {
    const claims = await verifyAccessJwt(token, env);
    return { email: claims.email || null, sub: claims.sub || null };
  } catch (error) {
    console.error('Access JWT rejected:', error && error.message ? error.message : error);
    return null;
  }
}
