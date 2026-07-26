import Link from "next/link";
import { FileText } from "lucide-react";
import SiteHeader from "./_components/SiteHeader";
import { getSections, GROUPS, type GroupKey, type SectionRow } from "./_lib/db";

export const dynamic = "force-dynamic";

const ORDER: GroupKey[] = ["director", "expenditure", "resources"];

export default async function Home() {
  const sections = await getSections();

  return (
    <div className="flex flex-col min-h-full">
      <SiteHeader />

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full" dir="rtl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#7a0020]">اختر قسمك</h2>
          <p className="text-sm text-neutral-500 mt-1">
            اضغط على القسم لعرض إجراءاته وتوثيقها
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 tracking-wide" dir="ltr">
            Select your section to view and document its procedures
          </p>
        </div>

        <div className="space-y-8">
          {ORDER.map((key) => {
            const group = sections.filter((s) => s.grp === key);
            if (!group.length) return null;
            return (
              <section key={key}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-[#c9a84c]/40" />
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-[#7a0020]">{GROUPS[key].ar}</h3>
                    <p className="text-[10px] text-neutral-400 tracking-wide" dir="ltr">
                      {GROUPS[key].en}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-[#c9a84c]/40" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((s) => (
                    <SectionCard key={s.slug} section={s} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function SectionCard({ section }: { section: SectionRow }) {
  return (
    <Link
      href={`/section/${section.slug}`}
      className="group block bg-white border border-[#e2d0c8] rounded-lg p-4 hover:border-[#7a0020] hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-[15px] text-[#1c1c1c] group-hover:text-[#7a0020] leading-snug">
          {section.name_ar}
        </h4>
        <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#7a0020] bg-[#7a0020]/8 rounded-full px-2 py-0.5">
          <FileText size={11} />
          {section.procedure_count}
        </span>
      </div>
      <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug" dir="ltr">
        {section.name_en}
      </p>
    </Link>
  );
}
