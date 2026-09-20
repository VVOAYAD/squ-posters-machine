import SiteHeader from "../_components/SiteHeader";
import ProofSheet from "../_components/ProofSheet";
import { getProofRows, getSections } from "../_lib/db";

export const dynamic = "force-dynamic";

export default async function ProofPage() {
  const [rows, sections] = await Promise.all([getProofRows(), getSections()]);
  return (
    <div className="flex flex-col min-h-full">
      <div className="print:hidden">
        <SiteHeader crumbs={[{ label: "سجل الإدخال" }]} />
      </div>
      <ProofSheet rows={rows} sections={sections} generatedAt={new Date().toISOString()} />
    </div>
  );
}
