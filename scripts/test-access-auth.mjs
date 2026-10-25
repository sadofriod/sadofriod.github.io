/**
 * Verifies the Cloudflare Access gate without touching the account: a real RSA keypair
 * signs the tokens, and `fetch` is stubbed to serve the matching certs document.
 */
import assert from 'node:assert/strict';
import { webcrypto as crypto } from 'node:crypto';
import { accessIdentity, verifyAccessJwt, accessConfigured } from '../lib/accessAuth.js';

const enc = new TextEncoder();
const b64url = (bytes) =>
  Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const json64 = (value) => b64url(enc.encode(JSON.stringify(value)));

const TEAM = 'ashesborn.cloudflareaccess.com';
const AUD = 'aud-tag-123';
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD };

const pair = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify']
);
const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
const jwk = { ...publicJwk, kid: 'test-kid', alg: 'RS256', use: 'sig' };

let certsCalls = 0;
globalThis.fetch = async (url, init) => {
  certsCalls += 1;
  assert.match(String(url), /\/cdn-cgi\/access\/certs$/);
  assert.equal(init?.cf?.cacheTtl, 3600);
  return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'content-type': 'application/json' } });
};

async function token(claims = {}, key = pair.privateKey, kid = 'test-kid') {
  const header = { alg: 'RS256', kid, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: AUD, email: 'justlikeashes@gmail.com', sub: 'user-1', iat: now, exp: now + 600, ...claims };
  const unsigned = `${json64(header)}.${json64(payload)}`;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(unsigned));
  return `${unsigned}.${b64url(new Uint8Array(signature))}`;
}

const request = (jwt) => new Request('https://blog.ashesborn.cloud/api/photos', {
  method: 'POST',
  headers: jwt ? { 'Cf-Access-Jwt-Assertion': jwt } : {},
});
const cookieRequest = (cookie, headers = {}) => new Request('https://blog.ashesborn.cloud/api/whoami', {
  headers: { ...(cookie ? { cookie } : {}), ...headers },
});

const results = [];
const check = async (name, fn) => {
  await fn();
  results.push(name);
};

// A valid token authenticates, and its claims come back.
await check('valid token -> email', async () => {
  const claims = await verifyAccessJwt(await token(), env);
  assert.equal(claims.email, 'justlikeashes@gmail.com');
  const identity = await accessIdentity(request(await token()), env);
  assert.equal(identity.email, 'justlikeashes@gmail.com');
});

// Certs are fetched once and then cached across requests.
await check('certs are cached', async () => {
  const before = certsCalls;
  await verifyAccessJwt(await token(), env);
  await verifyAccessJwt(await token(), env);
  assert.equal(certsCalls, before);
});

await check('no header -> anonymous', async () => {
  assert.equal(await accessIdentity(request(null), env), null);
});

await check('valid CF_Authorization cookie -> cookie identity', async () => {
  const identity = await accessIdentity(cookieRequest(`CF_Authorization=${await token()}`), env);
  assert.equal(identity.email, 'justlikeashes@gmail.com');
  assert.equal(identity.sub, 'user-1');
  assert.equal(identity.source, 'cookie');
});

await check('valid header wins over broken cookie', async () => {
  const identity = await accessIdentity(
    cookieRequest('CF_Authorization=broken-cookie', { 'Cf-Access-Jwt-Assertion': await token() }),
    env
  );
  assert.equal(identity.email, 'justlikeashes@gmail.com');
  assert.equal(identity.source, 'header');
});

await check('broken cookie without header -> anonymous', async () => {
  assert.equal(await accessIdentity(cookieRequest('CF_Authorization=broken-cookie'), env), null);
});

await check('split CF_Authorization cookie -> cookie identity', async () => {
  const jwt = await token();
  const splitAt = Math.floor(jwt.length / 2);
  const identity = await accessIdentity(
    cookieRequest(`CF_Authorization_1=${jwt.slice(splitAt)}; CF_Authorization_0=${jwt.slice(0, splitAt)}`),
    env
  );
  assert.equal(identity.source, 'cookie');
  assert.equal(identity.email, 'justlikeashes@gmail.com');
});

await check('unconfigured env -> anonymous', async () => {
  assert.equal(accessConfigured({}), false);
  assert.equal(await accessIdentity(request(await token()), {}), null);
});

await check('expired token rejected', async () => {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await token({ iat: now - 1200, exp: now - 600 });
  await assert.rejects(() => verifyAccessJwt(jwt, env), /expired/);
  assert.equal(await accessIdentity(request(jwt), env), null);
});

await check('wrong audience rejected', async () => {
  const jwt = await token({ aud: 'some-other-app' });
  await assert.rejects(() => verifyAccessJwt(jwt, env), /audience/);
  assert.equal(await accessIdentity(request(jwt), env), null);
});

await check('audience array accepted', async () => {
  const claims = await verifyAccessJwt(await token({ aud: ['other', AUD] }), env);
  assert.equal(claims.email, 'justlikeashes@gmail.com');
});

await check('forged signature rejected', async () => {
  const attacker = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );
  const jwt = await token({}, attacker.privateKey);
  await assert.rejects(() => verifyAccessJwt(jwt, env), /signature/);
  assert.equal(await accessIdentity(request(jwt), env), null);
});

await check('tampered payload rejected', async () => {
  const jwt = await token();
  const [h, , s] = jwt.split('.');
  const evil = json64({ aud: AUD, email: 'attacker@example.com', exp: Math.floor(Date.now() / 1000) + 600 });
  await assert.rejects(() => verifyAccessJwt(`${h}.${evil}.${s}`, env), /signature/);
});

await check('unknown kid rejected', async () => {
  const jwt = await token({}, pair.privateKey, 'unknown-kid');
  await assert.rejects(() => verifyAccessJwt(jwt, env), /signing key/);
});

await check('malformed token rejected', async () => {
  await assert.rejects(() => verifyAccessJwt('not-a-jwt', env), /malformed/);
});

console.log(`access auth: ${results.length} checks passed`);
for (const name of results) console.log(`  ✓ ${name}`);
