// Creates the schema and seeds the 14 sections. Safe to re-run.
//   npx dotenv -e .env.local -- node scripts/init-db.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL);
const sections = JSON.parse(readFileSync(new URL("../data/sections.json", import.meta.url), "utf8"));

await sql`
  create table if not exists sections (
    slug    text primary key,
    name_ar text not null,
    name_en text not null,
    grp     text not null,
    sort    int  not null
  )
`;

// `poster` holds the whole poster document (see app/_components/poster-core.tsx).
// title_ar/title_en are denormalized copies of the procedure name so the section
// list can render without parsing every poster.
await sql`
  create table if not exists procedures (
    id           serial primary key,
    section_slug text not null references sections(slug) on delete cascade,
    number       int  not null,
    title_ar     text not null default '',
    title_en     text not null default '',
    poster       jsonb not null default '{}'::jsonb,
    status       text not null default 'draft',
    updated_by   text not null default '',
    updated_at   timestamptz not null default now(),
    created_at   timestamptz not null default now()
  )
`;

// Migrate the first shape of this table (flat purpose/steps/documents/notes).
await sql`alter table procedures add column if not exists poster jsonb not null default '{}'::jsonb`;
await sql`alter table procedures drop column if exists purpose`;
await sql`alter table procedures drop column if exists steps`;
await sql`alter table procedures drop column if exists documents`;
await sql`alter table procedures drop column if exists notes`;

// procedure_id is nullable + ON DELETE SET NULL so a deleted procedure's history
// survives it; section_slug/number keep the orphaned rows readable.
await sql`
  create table if not exists revisions (
    id               serial primary key,
    procedure_id     int references procedures(id) on delete set null,
    section_slug     text not null default '',
    procedure_number int  not null default 0,
    action           text not null,
    editor           text not null default '',
    snapshot         jsonb not null,
    created_at       timestamptz not null default now()
  )
`;

// Migrate an earlier shape of this table if it exists.
await sql`alter table revisions add column if not exists section_slug text not null default ''`;
await sql`alter table revisions add column if not exists procedure_number int not null default 0`;
await sql`alter table revisions alter column procedure_id drop not null`;
await sql`alter table revisions drop constraint if exists revisions_procedure_id_fkey`;
await sql`
  alter table revisions
    add constraint revisions_procedure_id_fkey
    foreign key (procedure_id) references procedures(id) on delete set null
`;

await sql`create index if not exists procedures_section_idx on procedures (section_slug, number)`;
await sql`create index if not exists revisions_procedure_idx on revisions (procedure_id, created_at desc)`;

for (const s of sections) {
  await sql`
    insert into sections (slug, name_ar, name_en, grp, sort)
    values (${s.slug}, ${s.name_ar}, ${s.name_en}, ${s.grp}, ${s.sort})
    on conflict (slug) do update
      set name_ar = excluded.name_ar,
          name_en = excluded.name_en,
          grp     = excluded.grp,
          sort    = excluded.sort
  `;
}

const [{ count }] = await sql`select count(*)::int as count from sections`;
console.log(`✓ schema ready · ${count} sections seeded`);
