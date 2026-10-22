#!/usr/bin/env node
/**
 * Serves an in-process Postgres (PGlite) over the Postgres wire protocol on a
 * local port, so anything that speaks postgres:// can be exercised for real:
 *   - scripts/db-migrate.mjs (postgres.js over TCP)
 *   - the `postgres` client the Worker uses, with the exact queries from lib/
 *
 * Usage:
 *   node scripts/pg-wire-server.mjs [port]        # default 55432
 *   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres node scripts/db-migrate.mjs
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const port = Number(process.argv[2] ?? 55432);
const db = new PGlite();
const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });

await server.start();
console.log(`postgres wire protocol listening on 127.0.0.1:${port}`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
