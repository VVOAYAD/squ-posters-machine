import { notFound } from "next/navigation";
import SiteHeader from "../../../_components/SiteHeader";
import ProcedureEditor from "../../../_components/ProcedureEditor";
import { getSection, getProcedure, getRevisions } from "../../../_lib/db";

export const dynamic = "force-dynamic";

export default async function ProcedurePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const procedureId = Number(id);
  if (!Number.isInteger(procedureId)) notFound();

  const [section, procedure] = await Promise.all([getSection(slug), getProcedure(procedureId)]);
  if (!section || !procedure || procedure.section_slug !== slug) notFound();

  const revisions = await getRevisions(procedureId);

  return (
    <div className="flex flex-col h-full">
      <SiteHeader
        crumbs={[
          { label: section.name_ar, href: `/section/${slug}` },
          { label: `إجراء ${procedure.number}` },
        ]}
      />
      <ProcedureEditor
        procedure={procedure}
        revisions={revisions}
        sectionNameAr={section.name_ar}
        sectionNameEn={section.name_en}
        sectionSlug={slug}
      />
    </div>
  );
}
