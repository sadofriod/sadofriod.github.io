import postgres from 'postgres';

/**
 * One postgres.js client **per request**.
 *
 * Cloudflare Workers forbid reusing I/O objects (a Postgres socket is one) across
 * request contexts: a module-scoped client throws
 * "I/O created in one request handler cannot be accessed from another request's
 * handler" on the second request. Hyperdrive does the real pooling, so opening a
 * short-lived client per request is cheap and is the documented pattern.
 *
 * Test seam: anything that sets `env.HYPERDRIVE.sql` (see
 * scripts/test-worker-routes.mjs) gets that client instead.
 */
export function createDb(env) {
  if (env?.HYPERDRIVE?.sql) return env.HYPERDRIVE.sql;

  const connectionString = env?.HYPERDRIVE?.connectionString;
  if (!connectionString) {
    throw new Error('HYPERDRIVE binding is not configured');
  }

  return postgres(connectionString, { max: 1, prepare: false, fetch_types: false });
}

/**
 * Close the per-request client. Await it: the response body never depends on the
 * Postgres socket (R2 streams and JSON are already materialised), and a leaked
 * socket is worse than a millisecond — it holds a Hyperdrive connection and, in
 * local dev, hangs every later request.
 */
export async function closeDb(sql) {
  if (typeof sql?.end !== 'function') return;

  try {
    await sql.end({ timeout: 5 });
  } catch (error) {
    console.error('Failed to close the Postgres client:', error);
  }
}

export const isDatabaseConfigured = (env) =>
  Boolean(env?.HYPERDRIVE?.connectionString || env?.HYPERDRIVE?.sql);

export const databaseMissing = () =>
  Response.json({ error: 'Database is not configured (HYPERDRIVE binding missing)' }, { status: 503 });
