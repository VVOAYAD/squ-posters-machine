"use client";

/**
 * One sheet covering every procedure in the department, with the time each was
 * entered. Replaces taking a screenshot of each procedure one at a time.
 * Times come from the database, so the sheet cannot be back-dated locally.
 */

import { useRef, useState } from "react";
import { Download, Printer, FileDown } from "lucide-react";
import { exportPng } from "./poster-core";
import { GROUPS, type GroupKey, type ProofRow, type SectionRow } from "../_lib/db";

const ORDER: GroupKey[] = ["director", "expenditure", "resources"];

export default function ProofSheet({
  rows,
  sections,
  generatedAt,
}: {
  rows: ProofRow[];
  sections: SectionRow[];
  generatedAt: string;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const done = rows.filter((r) => r.status === "done").length;
  const empty = sections.filter((s) => !rows.some((r) => r.section_slug === s.slug));

  async function download() {
    setBusy(true);
    try {
      await exportPng(sheet.current, `سجل-إدخال-الإجراءات-${generatedAt.slice(0, 10)}.png`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 bg-neutral-200 print:bg-white p-6 print:p-0" dir="rtl">
      <div className="max-w-[1040px] mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <p className="text-[12px] text-neutral-600">
            كل إجراءات الدائرة في ورقة واحدة — بدل تصوير كل إجراء على حدة.
          </p>
          <div className="flex gap-2">
            <button
              onClick={download}
              disabled={busy}
              className="flex items-center gap-1.5 bg-[#7a0020] text-white text-sm font-bold rounded-md px-4 py-2 hover:bg-[#9b1535] disabled:opacity-50"
            >
              <Download size={14} />
              {busy ? "جارٍ التحضير..." : "تحميل صورة"}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white border border-[#7a0020] text-[#7a0020] text-sm font-bold rounded-md px-4 py-2 hover:bg-[#fbfaf6]"
            >
              <Printer size={14} />
              طباعة / PDF
            </button>
          </div>
        </div>

        {/* the sheet itself — everything inside is captured */}
        <div ref={sheet} className="bg-[#fbfaf6] p-8" style={{ width: 1000 }}>
          <div className="border-b-[3px] border-[#c9a84c] pb-3 mb-5">
            <h1 className="text-[20px] font-bold text-[#7a0020]">
              سجل إدخال الإجراءات — دائرة الشؤون المالية
            </h1>
            <p className="text-[12px] text-neutral-600 mt-1">
              جامعة السلطان قابوس · تاريخ إصدار السجل: {stamp(generatedAt)}
            </p>
            <p className="text-[12px] text-neutral-700 mt-2">
              إجمالي الإجراءات: <strong>{rows.length}</strong> · الأقسام:{" "}
              <strong>{sections.length}</strong> · المكتملة: <strong>{done}</strong> · المسودات:{" "}
              <strong>{rows.length - done}</strong>
              {empty.length > 0 && (
                <>
                  {" "}· <span className="text-[#7a0020] font-bold">
                    أقسام لم تُدخل شيئاً: {empty.length}
                  </span>
                </>
              )}
            </p>
          </div>

          {ORDER.map((grp) => {
            const inGroup = rows.filter((r) => r.grp === grp);
            const emptyHere = empty.filter((s) => s.grp === grp);
            if (!inGroup.length && !emptyHere.length) return null;
            const slugs = [...new Set(inGroup.map((r) => r.section_slug))];
            return (
              <div key={grp} className="mb-6">
                <h2 className="text-[13px] font-bold text-[#7a0020] bg-[#7a0020]/8 px-3 py-1.5 rounded">
                  {GROUPS[grp].ar}
                </h2>

                {slugs.map((slug) => {
                  const list = inGroup.filter((r) => r.section_slug === slug);
                  const last = list.reduce((a, b) => (a.created_at > b.created_at ? a : b));
                  return (
                    <div key={slug} className="mt-3 break-inside-avoid">
                      <div className="flex items-baseline justify-between border-b border-[#e2d0c8] pb-1 mb-1">
                        <h3 className="text-[13px] font-bold text-[#1c1c1c]">
                          {list[0].section_ar}{" "}
                          <span className="text-[11px] font-normal text-neutral-500">
                            ({list.length} إجراء)
                          </span>
                        </h3>
                        <span className="text-[11px] text-neutral-600">
                          آخر إدخال: {stamp(last.created_at)}
                        </span>
                      </div>

                      <table className="w-full text-[11.5px] border-collapse">
                        <thead>
                          <tr className="text-neutral-500 text-[10.5px]">
                            <th className="text-right font-medium w-8 py-1">#</th>
                            <th className="text-right font-medium py-1">الإجراء</th>
                            <th className="text-right font-medium w-[70px] py-1">الحالة</th>
                            <th className="text-right font-medium w-[150px] py-1">تاريخ الإدخال</th>
                            <th className="text-right font-medium w-[190px] py-1">آخر تعديل</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((r) => (
                            <tr key={`${r.section_slug}-${r.number}`} className="border-t border-neutral-200/70">
                              <td className="py-1 text-neutral-500">{r.number}</td>
                              <td className="py-1 text-[#1c1c1c]">
                                {r.title_ar || "إجراء بدون عنوان"}
                              </td>
                              <td className="py-1">
                                <span className={r.status === "done" ? "text-green-700" : "text-amber-700"}>
                                  {r.status === "done" ? "مكتمل" : "مسودة"}
                                </span>
                              </td>
                              <td className="py-1 text-neutral-700 tabular-nums">{stamp(r.created_at)}</td>
                              <td className="py-1 text-neutral-500">
                                {r.updated_by ? `${r.updated_by} · ${shortDate(r.updated_at)}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}

                {emptyHere.map((s) => (
                  <div
                    key={s.slug}
                    className="mt-3 flex items-baseline justify-between border-b border-[#e2d0c8] pb-1"
                  >
                    <h3 className="text-[13px] font-bold text-neutral-500">{s.name_ar}</h3>
                    <span className="text-[11px] font-bold text-[#7a0020]">
                      لم يُدخل أي إجراء
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

          <p className="text-[10.5px] text-neutral-500 border-t-2 border-[#c9a84c] pt-2 mt-4">
            التواريخ مأخوذة من قاعدة بيانات النظام وقت الإدخال، لا من جهاز المستخدم.
            · للاستفسار: المؤيد الريامي — هاتف داخلي 5102
          </p>
        </div>

        {busy && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <FileDown className="animate-pulse text-[#7a0020]" size={20} />
              <span className="font-medium">جارٍ تجهيز الصورة...</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function stamp(ts: string) {
  return new Date(ts).toLocaleString("ar-OM", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function shortDate(ts: string) {
  return new Date(ts).toLocaleDateString("ar-OM", { year: "numeric", month: "short", day: "numeric" });
}
