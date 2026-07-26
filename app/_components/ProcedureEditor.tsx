"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  CircleDashed,
  Download,
  FileDown,
  FileText,
  History,
  Save,
  Trash2,
} from "lucide-react";
import { LangHint, type Lang } from "./Shared";
import {
  PosterFields,
  PosterPreview,
  blankPoster,
  exportDocx,
  exportPng,
  normalizePoster,
  type PosterData,
} from "./poster-core";
import Flowchart from "./Flowchart";
import { AlignPicker, Divider, FontPicker, LangToggle, NumericSize } from "./Toolbar";
import { FONT_BY_KEY, type Align, type FontKey } from "./fonts";
import { saveProcedure, deleteProcedure } from "../_lib/actions";
import { getEditorName, rememberEditorName } from "../_lib/editor-name";
import type { ProcedureRow, RevisionRow } from "../_lib/db";

export default function ProcedureEditor({
  procedure,
  revisions,
  sectionNameAr,
  sectionNameEn,
  sectionSlug,
}: {
  procedure: ProcedureRow;
  revisions: RevisionRow[];
  sectionNameAr: string;
  sectionNameEn: string;
  sectionSlug: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [data, setData] = useState<PosterData>(() =>
    Object.keys((procedure.poster ?? {}) as object).length
      ? normalizePoster(procedure.poster, sectionNameAr, sectionNameEn)
      : blankPoster(sectionNameAr, sectionNameEn),
  );
  const [status, setStatus] = useState<"draft" | "done">(procedure.status);
  const [dirty, setDirty] = useState(false);

  const [lang, setLang] = useState<Lang>("ar");
  const [fontKey, setFontKey] = useState<FontKey>("cairo");
  const [sizeScale, setSizeScale] = useState(1);
  const [bodyAlign, setBodyAlign] = useState<Align>("justify");
  const font = FONT_BY_KEY[fontKey];

  const [showHistory, setShowHistory] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  type Intent = { kind: "save" } | { kind: "delete" };
  const [askName, setAskName] = useState<Intent | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  const arRef = useRef<HTMLDivElement>(null);
  const enRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof PosterData>(key: K, val: PosterData[K]) => {
    setData((d) => ({ ...d, [key]: val }));
    setDirty(true);
  };
  const toggleHide = (key: string) => {
    setData((d) => ({ ...d, hide: { ...d.hide, [key]: !d.hide[key] } }));
    setDirty(true);
  };

  const stamp = `${sectionSlug}_${procedure.number}`;

  /* ── persistence ─────────────────────────────────────────── */

  function commitSave(editor: string) {
    rememberEditorName(editor);
    start(async () => {
      await saveProcedure(procedure.id, sectionSlug, editor, {
        poster: data,
        title_ar: data.procedure_ar,
        title_en: data.procedure_en,
        status,
      });
      setDirty(false);
      router.refresh();
    });
  }

  function commitDelete(editor: string) {
    rememberEditorName(editor);
    start(async () => {
      await deleteProcedure(procedure.id, sectionSlug, editor);
    });
  }

  function run(intent: Intent, editor: string) {
    if (intent.kind === "save") commitSave(editor);
    else commitDelete(editor);
  }

  function ask(intent: Intent) {
    const saved = getEditorName();
    if (saved) return run(intent, saved);
    setNameDraft("");
    setAskName(intent);
  }

  /* ── downloads ───────────────────────────────────────────── */

  async function downloadPng(which: Lang) {
    setBusy(`PNG ${which.toUpperCase()}`);
    try {
      await exportPng(which === "ar" ? arRef.current : enRef.current, `procedure_${stamp}_${which}.png`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadFlowchart() {
    setBusy("flowchart");
    try {
      await exportPng(flowRef.current, `flowchart_${stamp}_${lang}.png`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadDocx() {
    setBusy(".docx");
    try {
      await exportDocx(data, font, sizeScale, bodyAlign, `procedure_${stamp}.docx`);
    } finally {
      setBusy(null);
    }
  }

  const previewStyle = {
    ["--font-poster" as string]: `var(${font.cssVar})`,
    ["--fs" as string]: sizeScale,
    ["--body-align" as string]: bodyAlign,
  };

  const flowTitle = lang === "ar" ? data.stepsHead_ar : data.stepsHead_en;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* toolbar */}
      <div className="bg-[#500015] text-white px-5 py-2 flex items-center justify-between gap-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => ask({ kind: "save" })}
            disabled={pending}
            className={`flex items-center gap-1.5 text-xs font-bold rounded-md px-3.5 py-1.5 transition-colors disabled:opacity-50 ${
              dirty ? "bg-[#c9a84c] text-[#500015] hover:bg-[#e8c55a]" : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <Save size={13} />
            {pending ? "جارٍ الحفظ..." : dirty ? "حفظ التغييرات" : "حفظ"}
          </button>

          <button
            onClick={() => setStatus((s) => (s === "done" ? "draft" : "done"))}
            className={`flex items-center gap-1.5 text-xs font-bold rounded-md px-3 py-1.5 transition-colors ${
              status === "done" ? "bg-green-600/90 text-white" : "bg-black/30 text-white/70 hover:text-white"
            }`}
            title="مسودة / مكتمل"
          >
            {status === "done" ? <CheckCircle2 size={13} /> : <CircleDashed size={13} />}
            {status === "done" ? "مكتمل" : "مسودة"}
          </button>

          <Divider />

          <button
            onClick={() => downloadPng(lang)}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/30 rounded-md px-2.5 py-1.5"
          >
            <Download size={12} /> PNG
          </button>
          <button
            onClick={downloadFlowchart}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/30 rounded-md px-2.5 py-1.5"
          >
            <Download size={12} /> مخطط
          </button>
          <button
            onClick={downloadDocx}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/30 rounded-md px-2.5 py-1.5"
          >
            <FileText size={12} /> .docx
          </button>
        </div>

        <div className="flex items-center gap-2">
          <FontPicker fontKey={fontKey} onChange={setFontKey} />
          <Divider />
          <NumericSize value={sizeScale} onChange={setSizeScale} />
          <Divider />
          <AlignPicker value={bodyAlign} onChange={setBodyAlign} />
          <Divider />
          <LangToggle value={lang} onChange={setLang} />
        </div>
      </div>

      {/* split screen */}
      <div className="flex-1 grid grid-cols-[440px_1fr] overflow-hidden">
        <aside className="overflow-y-auto bg-white border-r border-neutral-200 p-5 space-y-5">
          <div className="pb-3 border-b border-neutral-200 -mt-1">
            <Link
              href={`/section/${sectionSlug}`}
              className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-[#7a0020] mb-2"
              dir="rtl"
            >
              <ChevronLeft size={12} />
              {sectionNameAr}
            </Link>
            <div className="flex items-center gap-2" dir="rtl">
              <span className="w-7 h-7 rounded-full bg-[#7a0020] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {procedure.number}
              </span>
              <h2 className="text-sm font-bold text-[#7a0020] truncate">
                {data.procedure_ar || "إجراء بدون عنوان"}
              </h2>
            </div>
            {procedure.updated_by && (
              <p className="text-[10px] text-neutral-400 mt-1.5" dir="rtl">
                آخر تعديل: {procedure.updated_by} · {fmt(procedure.updated_at)}
              </p>
            )}
          </div>

          <LangHint lang={lang} />

          <PosterFields data={data} update={update} toggleHide={toggleHide} lang={lang} lockDept />

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-[#7a0020]"
            >
              <History size={12} />
              سجل التعديلات ({revisions.length})
            </button>
            <button
              onClick={() => {
                if (confirm(`حذف الإجراء رقم ${procedure.number} نهائياً؟`)) ask({ kind: "delete" });
              }}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={12} />
              حذف
            </button>
          </div>

          {showHistory && (
            <ul className="border border-neutral-200 rounded divide-y divide-neutral-100" dir="rtl">
              {revisions.map((r) => (
                <li key={r.id} className="px-3 py-2 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-700 font-medium">{r.editor || "غير معروف"}</span>
                  <span className="text-neutral-400">
                    {r.action === "created" ? "أنشأ" : r.action === "deleted" ? "حذف" : "عدّل"} ·{" "}
                    {fmtFull(r.created_at)}
                  </span>
                </li>
              ))}
              {revisions.length === 0 && (
                <li className="px-3 py-2 text-[11px] text-neutral-400 text-center">لا توجد تعديلات بعد</li>
              )}
            </ul>
          )}
        </aside>

        <main className="overflow-auto p-6 bg-neutral-200">
          <div className="flex flex-col items-center gap-4">
            <div className="text-[11px] text-neutral-500 tracking-widest uppercase">
              Live preview · {lang === "ar" ? "Arabic" : "English"} · {font.label} ·{" "}
              {Math.round(sizeScale * 100)}% · displayed at 65%
            </div>

            {/* `zoom` (not scale) so each preview still occupies real layout height —
                two stacked scale() blocks would overlap. */}
            <div style={{ zoom: 0.65 }}>
              <div ref={lang === "ar" ? arRef : enRef} style={previewStyle}>
                <PosterPreview data={data} lang={lang} />
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 tracking-widest uppercase pt-2">
              {lang === "ar" ? "المخطط الانسيابي · حسب الجهة" : "Flowchart · by department"}
            </div>

            <div style={{ zoom: 0.65 }}>
              <div ref={flowRef} style={previewStyle}>
                <Flowchart steps={data.steps} lang={lang} title={flowTitle} />
              </div>
            </div>
          </div>

          {/* off-screen twin so the other language exports without switching */}
          <div style={{ position: "absolute", left: -99999, top: 0 }} aria-hidden>
            <div ref={lang === "ar" ? enRef : arRef} style={previewStyle}>
              <PosterPreview data={data} lang={lang === "ar" ? "en" : "ar"} />
            </div>
          </div>
        </main>
      </div>

      {askName && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-lg shadow-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-[#7a0020] mb-1">اسمك</h3>
            <p className="text-[11px] text-neutral-500 mb-3">يُحفظ مع الإجراء في سجل التعديلات.</p>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nameDraft.trim()) {
                  const intent = askName;
                  setAskName(null);
                  run(intent, nameDraft.trim());
                }
              }}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020]"
              placeholder="الاسم الكامل"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (!nameDraft.trim()) return;
                  const intent = askName;
                  setAskName(null);
                  run(intent, nameDraft.trim());
                }}
                className="flex-1 bg-[#7a0020] text-white text-sm font-bold rounded-md py-2 hover:bg-[#9b1535]"
              >
                متابعة
              </button>
              <button
                onClick={() => setAskName(null)}
                className="px-4 text-sm text-neutral-500 hover:text-neutral-800"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {busy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <FileDown className="animate-pulse text-[#7a0020]" size={20} />
            <span className="font-medium">Generating {busy}...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(ts: string) {
  return new Date(ts).toLocaleDateString("ar-OM", { year: "numeric", month: "short", day: "numeric" });
}

function fmtFull(ts: string) {
  return new Date(ts).toLocaleString("ar-OM", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
