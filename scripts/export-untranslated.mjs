// Dumps every Arabic string that has no English counterpart yet.
//   npx dotenv -e .env.local -- node scripts/export-untranslated.mjs [outfile]
// Writes a JSON work-file; nothing is modified in the database.
import { neon } from "@neondatabase/serverless";
import { writeFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL);
const out = process.argv[2] || "translations.json";

const rows = await sql`select id, section_slug, number, poster from procedures order by section_slug, number`;

const has = (v) => typeof v === "string" && v.trim().length > 0;
const jobs = [];
let totalFields = 0;

for (const row of rows) {
  const p = row.poster || {};
  const need = {};

  // Plain paired fields: <name>_ar has text, <name>_en does not.
  for (const key of ["procedure", "date", "contact", "contactSub", "docsHead", "docsIntro", "stepsHead"]) {
    if (has(p[`${key}_ar`]) && !has(p[`${key}_en`])) need[key] = p[`${key}_ar`];
  }

  // Document list: translate positionally.
  const docsAr = (p.docs_ar || []).filter(has);
  const docsEn = (p.docs_en || []).filter(has);
  if (docsAr.length && docsEn.length < docsAr.length) need.docs = docsAr;

  // Steps: each may need a title and/or a description.
  const steps = (p.steps || []).map((s, i) => {
    const item = { i };
    if (has(s.title_ar) && !has(s.title_en)) item.title = s.title_ar;
    if (has(s.desc_ar) && !has(s.desc_en)) item.desc = s.desc_ar;
    return Object.keys(item).length > 1 ? item : null;
  }).filter(Boolean);
  if (steps.length) need.steps = steps;

  if (!Object.keys(need).length) continue;

  totalFields += Object.entries(need).reduce((n, [k, v]) =>
    n + (k === "docs" ? v.length : k === "steps" ? v.reduce((m, s) => m + (s.title ? 1 : 0) + (s.desc ? 1 : 0), 0) : 1), 0);

  jobs.push({ id: row.id, section: row.section_slug, number: row.number, ar: need });
}

writeFileSync(out, JSON.stringify(jobs, null, 2), "utf8");
console.log(`${jobs.length} of ${rows.length} procedures need English · ${totalFields} strings · → ${out}`);
