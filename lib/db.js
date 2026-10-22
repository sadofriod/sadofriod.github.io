import postgres from 'postgres';

let cached;
let cachedConnection;

/**
 * One postgres.js client per Worker isolate, bound to the Hyperdrive connection
 * string. Hyperdrive does the pooling in front of the origin database, so the
 * client itself stays small (`max: 5`) and avoids prepared statements.
 */
export function db(env) {
  // Test seam: scripts/test-worker-routes.mjs injects a PGlite-backed client so the
  // real routers can be exercised without a database. Production only ever has the
  // Hyperdrive connection string.
  if (env?.HYPERDRIVE?.sql) return env.HYPERDRIVE.sql;

  const connectionString = env?.HYPERDRIVE?.connectionString;

  if (!connectionString) {
    throw new Error('HYPERDRIVE binding is not configured');
  }

  if (!cached || cachedConnection !== connectionString) {
    cached = postgres(connectionString, { max: 5, prepare: false, fetch_types: false });
    cachedConnection = connectionString;
  }

  return cached;
}

export const isDatabaseConfigured = (env) =>
  Boolean(env?.HYPERDRIVE?.connectionString || env?.HYPERDRIVE?.sql);

export const databaseMissing = () =>
  Response.json({ error: 'Database is not configured (HYPERDRIVE binding missing)' }, { status: 503 });
