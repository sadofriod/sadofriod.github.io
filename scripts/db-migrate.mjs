#!/usr/bin/env node
/**
 * Apply every migrations/*.sql file to the Postgres database behind Hyperdrive.
 *
 * Hyperdrive is only a proxy — migrations run straight against the origin. Pass
 * the origin connection string (Neon / Supabase / self-hosted), not the
 * Hyperdrive one:
 *
 *   DATABASE_URL='postgres://user:pass@host/db?sslmode=require' node scripts/db-migrate.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required (origin database connection string).');
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(root, 'migrations');

const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

const sql = postgres(connectionString, { max: 1, prepare: false, onnotice: () => {} });

try {
  for (const file of files) {
    const text = await readFile(path.join(migrationsDir, file), 'utf8');
    await sql.unsafe(text);
    console.log(`applied ${file}`);
  }

  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name`;

  console.log('tables:', tables.map((row) => row.table_name).join(', ') || '(none)');
} finally {
  await sql.end({ timeout: 5 });
}
