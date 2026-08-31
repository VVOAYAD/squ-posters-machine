// Writes reviewed English back into procedures.poster.
//   npx dotenv -e .env.local -- node scripts/import-translations.mjs <file> [--apply]
// Dry-run by default. Arabic is never touched, and an English field that a
// person has since filled in is left alone — the DB is re-read at write time.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL);
const file = process.argv[2];
const apply = process.argv.includes("--apply");
if (!file) { console.error("usage: import-translations.mjs <file> [--apply]"); process.exit(1); }

const EDITOR = "ترجمة — بانتظار المراجعة";
const jobs = JSON.parse(readFileSync(file, "utf8"));
const has = (v) => typeof v === "string" && v.trim().length > 0;

let touched = 0, fields = 0, skipped = 0;

for (const job of jobs) {
  if (!job.en || !Object.keys(job.en).length) continue;

  const rows = await sql`select poster from procedures where id = ${job.id}`;
  if (!rows.length) { console.log(`! ${job.id} no longer exists — skipped`); continue; }
  const p = { ...rows[0].poster };
  let changed = 0;

  for (const key of ["procedure", "date", "contact", "contactSub", "docsHead", "docsIntro", "stepsHead"]) {
    if (!has(job.en[key])) continue;
    if (has(p[`${key}_en`])) { skipped++; continue; }   // a person got there first
    p[`${key}_en`] = job.en[key];
    changed++;
  }

  if (Array.isArray(job.en.docs)) {
    const existing = p.docs_en || [];
    if (existing.filter(has).length >= (p.docs_ar || []).filter(has).length && existing.filter(has).length > 0) {
      skipped += job.en.docs.length;
    } else {
      p.docs_en = job.en.docs;
      changed += job.en.docs.length;
    }
  }

  if (Array.isArray(job.en.steps)) {
    p.steps = (p.steps || []).map((s, i) => {
      const t = job.en.steps.find((x) => x.i === i);
      if (!t) return s;
      const next = { ...s };
      if (has(t.title)) { if (has(s.title_en)) skipped++; else { next.title_en = t.title; changed++; } }
      if (has(t.desc))  { if (has(s.desc_en))  skipped++; else { next.desc_en  = t.desc;  changed++; } }
      return next;
    });
  }

  if (!changed) continue;
  touched++; fields += changed;

  if (apply) {
    await sql`
      update procedures
      set poster = ${JSON.stringify(p)}::jsonb,
          title_en = case when title_en = '' then ${p.procedure_en ?? ""} else title_en end
      where id = ${job.id}
    `;
    await sql`
      insert into revisions (procedure_id, section_slug, procedure_number, action, editor, snapshot)
      select id, section_slug, number, 'updated', ${EDITOR}, to_jsonb(p) from procedures p where p.id = ${job.id}
    `;
  }
  console.log(`${apply ? "wrote" : "would write"} ${String(changed).padStart(3)} fields → ${job.section} #${job.number}`);
}

console.log(`\n${apply ? "APPLIED" : "DRY RUN"} · ${touched} procedures · ${fields} fields · ${skipped} left alone (already had English)`);
if (!apply) console.log("re-run with --apply to write.");
