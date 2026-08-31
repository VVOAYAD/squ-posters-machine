"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql, type ProcedureRow } from "./db";

export type SaveInput = {
  /** The full poster document, serialized. */
  poster: unknown;
  title_ar: string;
  title_en: string;
  status: "draft" | "done";
};

// Snapshots the procedure as it stands right now. Call AFTER a write so the
// snapshot is the new state; call BEFORE a delete so the final state is kept.
async function logRevision(procedureId: number, action: string, editor: string) {
  await sql()`
    insert into revisions (procedure_id, section_slug, procedure_number, action, editor, snapshot)
    select p.id, p.section_slug, p.number, ${action}, ${editor}, to_jsonb(p)
    from procedures p where p.id = ${procedureId}
  `;
}

/**
 * Renumbers a section 1..N in the given id order, in one statement.
 * `number` carries no unique constraint, so no shuffling dance is needed.
 */
async function renumber(slug: string, orderedIds: number[]) {
  if (!orderedIds.length) return;
  await sql()`
    update procedures as p
    set number = v.pos
    from (
      select id, ordinality::int as pos
      from unnest(${orderedIds}::int[]) with ordinality as t(id, ordinality)
    ) as v
    where p.id = v.id and p.section_slug = ${slug}
  `;
}

async function orderedIds(slug: string): Promise<number[]> {
  const rows = (await sql()`
    select id from procedures where section_slug = ${slug} order by number, id
  `) as { id: number }[];
  return rows.map((r) => r.id);
}

/**
 * @param position 1-based slot the new procedure should occupy.
 *                 Omit (or pass 0) to append at the end.
 */
export async function createProcedure(slug: string, editor: string, position?: number) {
  const name = editor.trim() || "غير معروف";

  const rows = (await sql()`
    insert into procedures (section_slug, number, updated_by)
    values (
      ${slug},
      coalesce((select max(number) from procedures where section_slug = ${slug}), 0) + 1,
      ${name}
    )
    returning *
  `) as ProcedureRow[];

  const created = rows[0];

  if (position && position > 0) {
    const ids = (await orderedIds(slug)).filter((id) => id !== created.id);
    const at = Math.min(Math.max(position - 1, 0), ids.length);
    ids.splice(at, 0, created.id);
    await renumber(slug, ids);
  }

  await logRevision(created.id, "created", name);
  revalidatePath("/");

  revalidatePath(`/section/${slug}`);
  redirect(`/section/${slug}/${created.id}`);
}

export async function saveProcedure(id: number, slug: string, editor: string, data: SaveInput) {
  const name = editor.trim() || "غير معروف";

  await sql()`
    update procedures set
      poster     = ${JSON.stringify(data.poster)}::jsonb,
      title_ar   = ${data.title_ar},
      title_en   = ${data.title_en},
      status     = ${data.status},
      updated_by = ${name},
      updated_at = now()
    where id = ${id}
  `;

  await logRevision(id, "updated", name);
  revalidatePath("/");
  revalidatePath(`/section/${slug}`);
  revalidatePath(`/section/${slug}/${id}`);
}

export async function deleteProcedure(id: number, slug: string, editor: string) {
  // Log before the row disappears; the FK is ON DELETE SET NULL, so this row and
  // the procedure's earlier history both survive the delete.
  await logRevision(id, "deleted", editor.trim() || "غير معروف");
  await sql()`delete from procedures where id = ${id}`;
  revalidatePath("/");
  revalidatePath(`/section/${slug}`);
  redirect(`/section/${slug}`);
}

/**
 * Moves a procedure to a 1-based position within its section and renumbers
 * the rest so the list stays 1..N with no gaps.
 */
export async function moveProcedure(slug: string, id: number, toPosition: number) {
  const ids = await orderedIds(slug);
  const from = ids.indexOf(id);
  if (from === -1) return;

  const to = Math.min(Math.max(toPosition - 1, 0), ids.length - 1);
  if (from === to) return;

  ids.splice(from, 1);
  ids.splice(to, 0, id);
  await renumber(slug, ids);

  revalidatePath("/");
  revalidatePath(`/section/${slug}`);
}
