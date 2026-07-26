import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleDashed, FileText, ChevronLeft } from "lucide-react";
import SiteHeader from "../../_components/SiteHeader";
import AddProcedureButton from "../../_components/AddProcedureButton";
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
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#7a0020]">{section.name_ar}</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5" dir="ltr">
              {section.name_en}
            </p>
          </div>
          <AddProcedureButton slug={slug} />
        </div>

        {procedures.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e2d0c8] rounded-lg py-14 text-center">
            <FileText className="mx-auto text-neutral-300" size={30} />
            <p className="text-sm text-neutral-500 mt-3">لا توجد إجراءات مسجّلة بعد</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              اضغط «إضافة إجراء» لتسجيل أول إجراء في هذا القسم
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {procedures.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/section/${slug}/${p.id}`}
                  className="group flex items-center gap-4 bg-white border border-[#e2d0c8] rounded-lg px-4 py-3 hover:border-[#7a0020] hover:shadow-sm transition-all"
                >
                  <span className="shrink-0 w-8 h-8 rounded-full bg-[#7a0020]/8 text-[#7a0020] font-bold text-sm flex items-center justify-center">
                    {p.number}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] text-[#1c1c1c] group-hover:text-[#7a0020] truncate">
                      {p.title_ar || "إجراء بدون عنوان"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {p.updated_by
                        ? `آخر تعديل: ${p.updated_by} · ${fmt(p.updated_at)}`
                        : "لم يُعدَّل بعد"}
                    </p>
                  </div>

                  <StatusPill status={p.status} />
                  <ChevronLeft size={16} className="text-neutral-300 group-hover:text-[#7a0020] shrink-0" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const done = status === "done";
  return (
    <span
      className={`shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 ${
        done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {done ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />}
      {done ? "مكتمل" : "مسودة"}
    </span>
  );
}

function fmt(ts: string) {
  return new Date(ts).toLocaleDateString("ar-OM", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
