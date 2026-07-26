import { notFound } from "next/navigation";
import SiteHeader from "../../../_components/SiteHeader";
import ProcedureView from "../../../_components/ProcedureView";
import { getSection, getProcedure, getRevisions } from "../../../_lib/db";

export const dynamic = "force-dynamic";

export default async function ProcedurePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { slug, id } = await params;
  const { edit } = await searchParams;

  const procedureId = Number(id);
  if (!Number.isInteger(procedureId)) notFound();

  const [section, procedure] = await Promise.all([getSection(slug), getProcedure(procedureId)]);
  if (!section || !procedure || procedure.section_slug !== slug) notFound();

  const revisions = await getRevisions(procedureId);

  return (
    <div className="flex flex-col min-h-full">
      <SiteHeader
        crumbs={[
          { label: section.name_ar, href: `/section/${slug}` },
          { label: `إجراء ${procedure.number}` },
        ]}
      />
      <ProcedureView
        procedure={procedure}
        revisions={revisions}
        sectionName={section.name_ar}
        startInEdit={edit === "1"}
      />
    </div>
  );
}
