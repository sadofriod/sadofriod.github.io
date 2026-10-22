/**
 * D1 helpers. D1 is a binding, not a socket: there is no per-request client to
 * create or close (unlike a Postgres driver), so this file is deliberately tiny.
 */

export function getDb(env) {
  if (env?.DB) return env.DB;

  throw new Error('DB binding is not configured');
}

export const isDatabaseConfigured = (env) => Boolean(env?.DB);

export const databaseMissing = () =>
  Response.json({ error: 'Database is not configured (DB binding missing)' }, { status: 503 });

/** JSON array column → string[] (columns are stored as TEXT). */
export function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** string[] → JSON text for storage. */
export const toJsonArray = (values) => JSON.stringify(Array.isArray(values) ? values : []);
