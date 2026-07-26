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

export async function createProcedure(slug: string, editor: string) {
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
