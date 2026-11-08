import fs from 'node:fs';
import path from 'node:path';

export const DEMO_IDS = ['ldo', 'audits'] as const;
export type DemoId = (typeof DEMO_IDS)[number];

export type DemoDoc = {
  id: string;
  name: string;
  kind: string;
  meta: string;
  url: string;
};

export type DemoClaim = {
  doc: string;
  id: string;
  title: string;
  claim: string;
  section: string;
  anchor: string;
  verify: string;
  ev:
    | { type: 'mark'; text: string; hl: string }
    | { type: 'code'; lines: [string, string][]; hl?: string; note?: string };
  before?: string;
  after?: string;
};

export type DemoGap = { q: string; a: string; why: string };

export type Demo = {
  id: DemoId;
  title: string;
  subtitle: string;
  kind: 'browse';
  sources: { label: string; url: string }[];
  snapshot: string;
  docs: DemoDoc[];
  claims: DemoClaim[];
  gaps: DemoGap[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, file: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${file}: missing or invalid required field "${field}"`);
  }
}

function validateDemo(value: unknown, id: DemoId, file: string): Demo {
  if (!isRecord(value)) throw new Error(`${file}: expected a JSON object`);
  for (const field of ['id', 'title', 'subtitle', 'kind', 'snapshot']) {
    requireString(value[field], field, file);
  }
  if (value.id !== id) throw new Error(`${file}: field "id" must be "${id}"`);
  if (value.kind !== 'browse') throw new Error(`${file}: field "kind" must be "browse"`);

  for (const field of ['sources', 'docs', 'claims', 'gaps']) {
    if (!Array.isArray(value[field])) throw new Error(`${file}: missing or invalid required field "${field}"`);
  }

  (value.sources as unknown[]).forEach((source, index) => {
    if (!isRecord(source)) throw new Error(`${file}: sources[${index}] must be an object`);
    for (const field of ['label', 'url']) requireString(source[field], `sources[${index}].${field}`, file);
  });

  (value.docs as unknown[]).forEach((doc, index) => {
    if (!isRecord(doc)) throw new Error(`${file}: docs[${index}] must be an object`);
    for (const field of ['id', 'name', 'kind', 'meta', 'url']) {
      requireString(doc[field], `docs[${index}].${field}`, file);
    }
  });

  (value.claims as unknown[]).forEach((claim, index) => {
    const prefix = `claims[${index}]`;
    if (!isRecord(claim)) throw new Error(`${file}: ${prefix} must be an object`);
    for (const field of ['doc', 'id', 'title', 'claim', 'section', 'anchor', 'verify']) {
      requireString(claim[field], `${prefix}.${field}`, file);
    }
    if (claim.before !== undefined) requireString(claim.before, `${prefix}.before`, file);
    if (claim.after !== undefined) requireString(claim.after, `${prefix}.after`, file);
    if (!isRecord(claim.ev)) throw new Error(`${file}: missing or invalid required field "${prefix}.ev"`);
    if (claim.ev.type === 'mark') {
      requireString(claim.ev.text, `${prefix}.ev.text`, file);
      requireString(claim.ev.hl, `${prefix}.ev.hl`, file);
    } else if (claim.ev.type === 'code') {
      if (!Array.isArray(claim.ev.lines)) {
        throw new Error(`${file}: missing or invalid required field "${prefix}.ev.lines"`);
      }
      claim.ev.lines.forEach((line, lineIndex) => {
        if (!Array.isArray(line) || line.length !== 2) {
          throw new Error(`${file}: ${prefix}.ev.lines[${lineIndex}] must be a [lineNo, text] pair`);
        }
        requireString(line[0], `${prefix}.ev.lines[${lineIndex}][0]`, file);
        if (typeof line[1] !== 'string') {
          throw new Error(`${file}: invalid required field "${prefix}.ev.lines[${lineIndex}][1]"`);
        }
      });
      // Some source excerpts intentionally have no single highlighted line.
      if (claim.ev.hl !== undefined) requireString(claim.ev.hl, `${prefix}.ev.hl`, file);
      if (claim.ev.note !== undefined) requireString(claim.ev.note, `${prefix}.ev.note`, file);
    } else {
      throw new Error(`${file}: ${prefix}.ev.type must be "mark" or "code"`);
    }
  });

  (value.gaps as unknown[]).forEach((gap, index) => {
    if (!isRecord(gap)) throw new Error(`${file}: gaps[${index}] must be an object`);
    for (const field of ['q', 'a', 'why']) requireString(gap[field], `gaps[${index}].${field}`, file);
  });

  const docIds = new Set((value.docs as DemoDoc[]).map((doc) => doc.id));
  (value.claims as DemoClaim[]).forEach((claim, index) => {
    if (!docIds.has(claim.doc)) throw new Error(`${file}: claims[${index}].doc references unknown document "${claim.doc}"`);
  });

  return value as unknown as Demo;
}

export function getDemo(id: string): Demo | undefined {
  if (!DEMO_IDS.includes(id as DemoId)) return undefined;
  const file = `${id}.json`;
  const filePath = path.join(process.cwd(), 'data/demos', `${id}.json`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${file}: unable to read or parse demo data (${error instanceof Error ? error.message : String(error)})`);
  }
  return validateDemo(parsed, id as DemoId, file);
}

export function getAllDemos(): Demo[] {
  return DEMO_IDS.map((id) => getDemo(id) as Demo);
}
