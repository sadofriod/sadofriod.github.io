#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES = ['en', 'zh', 'ja', 'ko', 'es'];

function escapeSingleQuoted(value) {
  let s = String(value);
  s = s.replace(/\\/g, '\\\\');
  s = s.replace(/'/g, "\\'");
  s = s.replace(/\r?\n/g, '\\n');
  return `'${s}'`;
}

function extractEntries(data) {
  const entries = {};
  for (const key of Object.keys(data)) {
    if (key.startsWith('_')) continue;
    const value = data[key];
    const isLocaleMap =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      LOCALES.some((l) => typeof value[l] === 'string');
    if (isLocaleMap) {
      entries[key] = value;
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const subKey of Object.keys(value)) {
        if (subKey.startsWith('_')) continue;
        const sub = value[subKey];
        if (
          sub &&
          typeof sub === 'object' &&
          !Array.isArray(sub) &&
          LOCALES.some((l) => typeof sub[l] === 'string')
        ) {
          entries[subKey] = sub;
        }
      }
    }
  }
  return entries;
}

const filePath = process.argv[2] ?? './i18n-strings.json';
const data = JSON.parse(readFileSync(filePath, 'utf8'));
const entries = extractEntries(data);

const target = resolve(process.cwd(), 'lib/i18n/translations.ts');
let src = readFileSync(target, 'utf8');

const fnIdx = src.indexOf('export function getTranslation');
const closeIdx = src.lastIndexOf('};', fnIdx);

let added = 0;
let skipped = 0;
const chunks = [];

for (const key of Object.keys(entries)) {
  if (src.includes(`'${key}':`)) {
    skipped += 1;
    continue;
  }
  const entry = entries[key];
  const lines = [`  '${key}': {`];
  for (let i = 0; i < LOCALES.length; i += 1) {
    const loc = LOCALES[i];
    const comma = i < LOCALES.length - 1 ? ',' : '';
    lines.push(`    ${loc}: ${escapeSingleQuoted(entry[loc])}${comma}`);
  }
  lines.push('  },');
  chunks.push(`${lines.join('\n')}\n`);
  added += 1;
}

src = src.slice(0, closeIdx) + chunks.join('') + src.slice(closeIdx);
writeFileSync(target, src);

console.log(`新增 ${added} 条 / 跳过 ${skipped} 条`);
