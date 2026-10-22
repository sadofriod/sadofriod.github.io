/**
 * Helpers for the two things postgres.js' Workers build cannot do for us.
 *
 * The Worker runs with `prepare: false` (Hyperdrive + no type inference), so:
 *   - a JS array parameter is sent as the string "a,b" and Postgres rejects it
 *     ("malformed array literal") — build the literal ourselves;
 *   - `fetch_types: false` means an array column comes back as its text form
 *     (`{a,"b,c"}`) — select `array_to_json(col)` and JSON.parse it instead.
 */

/** `['a', 'b,c']` → `{"a","b,c"}` (double-quoted, Postgres escaping). */
export function pgTextArray(values) {
  const items = (Array.isArray(values) ? values : []).map(
    (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  );

  return `{${items.join(',')}}`;
}

/** Value of an `array_to_json(...)` column → JS array. */
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
