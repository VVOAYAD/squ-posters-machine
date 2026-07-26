import { neon } from "@neondatabase/serverless";

// Lazy init — top-level neon() would throw during `next build` before env vars exist.
let _sql: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export const GROUPS = {
  director: { ar: "مدير دائرة الشؤون المالية", en: "Director of the Financial Affairs Department" },
  expenditure: { ar: "نائب المدير للمصروفات", en: "Deputy Director for Expenditure" },
  resources: { ar: "نائب المدير للموارد المالية", en: "Deputy Director for Financial Resources" },
} as const;

export type GroupKey = keyof typeof GROUPS;

export type SectionRow = {
  slug: string;
  name_ar: string;
  name_en: string;
  grp: GroupKey;
  sort: number;
  procedure_count: number;
};

export type ProcedureRow = {
  id: number;
  section_slug: string;
  number: number;
  title_ar: string;
  title_en: string;
  purpose: string;
  steps: string[];
  documents: string[];
  notes: string;
  status: "draft" | "done";
  updated_by: string;
  updated_at: string;
  created_at: string;
};

export type RevisionRow = {
  id: number;
  procedure_id: number;
  action: string;
  editor: string;
  created_at: string;
};

export async function getSections(): Promise<SectionRow[]> {
  return (await sql()`
    select s.slug, s.name_ar, s.name_en, s.grp, s.sort,
           count(p.id)::int as procedure_count
    from sections s
    left join procedures p on p.section_slug = s.slug
    group by s.slug, s.name_ar, s.name_en, s.grp, s.sort
    order by s.grp, s.sort
  `) as SectionRow[];
}

export async function getSection(slug: string): Promise<SectionRow | null> {
  const rows = (await sql()`
    select slug, name_ar, name_en, grp, sort, 0 as procedure_count
    from sections where slug = ${slug}
  `) as SectionRow[];
  return rows[0] ?? null;
}

export async function getProcedures(slug: string): Promise<ProcedureRow[]> {
  return (await sql()`
    select * from procedures where section_slug = ${slug} order by number
  `) as ProcedureRow[];
}

export async function getProcedure(id: number): Promise<ProcedureRow | null> {
  const rows = (await sql()`select * from procedures where id = ${id}`) as ProcedureRow[];
  return rows[0] ?? null;
}

export async function getRevisions(id: number): Promise<RevisionRow[]> {
  return (await sql()`
    select id, procedure_id, action, editor, created_at
    from revisions where procedure_id = ${id} order by created_at desc
  `) as RevisionRow[];
}
