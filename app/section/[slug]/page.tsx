import { notFound } from "next/navigation";
import SiteHeader from "../../_components/SiteHeader";
import ProcedureList from "../../_components/ProcedureList";
import { getSection, getProcedures } from "../../_lib/db";

export const dynamic = "force-dynamic";

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = await getSection(slug);
  if (!section) notFound();

  const procedures = await getProcedures(slug);

  return (
    <div className="flex flex-col min-h-full">
      <SiteHeader crumbs={[{ label: section.name_ar }]} />

      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full" dir="rtl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#7a0020]">{section.name_ar}</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5" dir="ltr">
            {section.name_en}
          </p>
        </div>

        <ProcedureList slug={slug} procedures={procedures} />
      </main>
    </div>
  );
}
