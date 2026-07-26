"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X, Plus, Trash2, History, CheckCircle2, CircleDashed } from "lucide-react";
import { saveProcedure, deleteProcedure, type ProcedureInput } from "../_lib/actions";
import { getEditorName, rememberEditorName } from "../_lib/editor-name";
import type { ProcedureRow, RevisionRow } from "../_lib/db";

export default function ProcedureView({
  procedure,
  revisions,
  sectionName,
  startInEdit,
}: {
  procedure: ProcedureRow;
  revisions: RevisionRow[];
  sectionName: string;
  startInEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(startInEdit);
  const [pending, start] = useTransition();
  // Both save and delete are recorded against a person, so either can trigger
  // the "who are you?" prompt when this browser has no name stored yet.
  type Intent = { kind: "save"; data: ProcedureInput } | { kind: "delete" };
  const [askName, setAskName] = useState<Intent | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const [form, setForm] = useState<ProcedureInput>({
    title_ar: procedure.title_ar,
    title_en: procedure.title_en,
    purpose: procedure.purpose,
    steps: procedure.steps.length ? procedure.steps : [""],
    documents: procedure.documents.length ? procedure.documents : [""],
    notes: procedure.notes,
    status: procedure.status,
  });

  const set = <K extends keyof ProcedureInput>(k: K, v: ProcedureInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function commit(data: ProcedureInput, editor: string) {
    rememberEditorName(editor);
    start(async () => {
      await saveProcedure(procedure.id, procedure.section_slug, editor, data);
      setEditing(false);
      router.replace(`/section/${procedure.section_slug}/${procedure.id}`);
      router.refresh();
    });
  }

  function remove(editor: string) {
    rememberEditorName(editor);
    start(async () => {
      await deleteProcedure(procedure.id, procedure.section_slug, editor);
    });
  }

  function run(intent: Intent, editor: string) {
    if (intent.kind === "save") commit(intent.data, editor);
    else remove(editor);
  }

  function ask(intent: Intent) {
    const saved = getEditorName();
    if (saved) return run(intent, saved);
    setNameDraft("");
    setAskName(intent);
  }

  function onSave() {
    ask({ kind: "save", data: form });
  }

  function onDelete() {
    if (!confirm(`حذف الإجراء رقم ${procedure.number} نهائياً؟`)) return;
    ask({ kind: "delete" });
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full" dir="rtl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#7a0020] text-white font-bold text-sm flex items-center justify-center shrink-0">
              {procedure.number}
            </span>
            <h2 className="text-xl font-bold text-[#7a0020] truncate">
              {form.title_ar || "إجراء بدون عنوان"}
            </h2>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5">
            {sectionName}
            {procedure.updated_by && ` · آخر تعديل: ${procedure.updated_by} · ${fmt(procedure.updated_at)}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <button
                onClick={onSave}
                disabled={pending}
                className="flex items-center gap-1.5 bg-[#7a0020] text-white text-sm font-bold rounded-md px-4 py-2 hover:bg-[#9b1535] disabled:opacity-50"
              >
                <Save size={15} />
                {pending ? "جارٍ الحفظ..." : "حفظ"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 px-2"
              >
                <X size={15} />
                إلغاء
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 bg-[#7a0020] text-white text-sm font-bold rounded-md px-4 py-2 hover:bg-[#9b1535]"
            >
              <Pencil size={15} />
              تعديل
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#e2d0c8] rounded-lg p-5 space-y-5">
        {editing ? (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              <Text label="عنوان الإجراء (عربي)" value={form.title_ar} onChange={(v) => set("title_ar", v)} />
              <Text
                label="Procedure title (English)"
                value={form.title_en}
                onChange={(v) => set("title_en", v)}
                dir="ltr"
              />
            </div>
            <Area label="الغرض من الإجراء" value={form.purpose} onChange={(v) => set("purpose", v)} rows={3} />
            <List label="خطوات الإجراء" items={form.steps} onChange={(v) => set("steps", v)} numbered />
            <List
              label="المستندات المطلوبة"
              items={form.documents}
              onChange={(v) => set("documents", v)}
            />
            <Area label="ملاحظات" value={form.notes} onChange={(v) => set("notes", v)} rows={3} />

            <label className="flex items-center gap-2 text-sm cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.status === "done"}
                onChange={(e) => set("status", e.target.checked ? "done" : "draft")}
                className="accent-[#7a0020] w-4 h-4"
              />
              <span className="text-neutral-700 font-medium">تحديد الإجراء كمكتمل</span>
            </label>
          </>
        ) : (
          <>
            <Badge status={procedure.status} />
            {procedure.title_en && (
              <p className="text-sm text-neutral-500" dir="ltr">
                {procedure.title_en}
              </p>
            )}
            <Block title="الغرض من الإجراء" text={procedure.purpose} />
            <BlockList title="خطوات الإجراء" items={procedure.steps} numbered />
            <BlockList title="المستندات المطلوبة" items={procedure.documents} />
            <Block title="ملاحظات" text={procedure.notes} />
            {!procedure.purpose && !procedure.steps.length && !procedure.documents.length && (
              <p className="text-sm text-neutral-400 text-center py-6">
                هذا الإجراء فارغ — اضغط «تعديل» لتعبئته
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#7a0020]"
        >
          <History size={13} />
          سجل التعديلات ({revisions.length})
        </button>
        <button onClick={onDelete} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600">
          <Trash2 size={13} />
          حذف الإجراء
        </button>
      </div>

      {showHistory && (
        <ul className="mt-3 bg-white border border-[#e2d0c8] rounded-lg divide-y divide-neutral-100">
          {revisions.map((r) => (
            <li key={r.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-neutral-700 font-medium">{r.editor || "غير معروف"}</span>
              <span className="text-neutral-400">
                {r.action === "created" ? "أنشأ الإجراء" : r.action === "deleted" ? "حذف" : "عدّل"} ·{" "}
                {fmtFull(r.created_at)}
              </span>
            </li>
          ))}
          {revisions.length === 0 && (
            <li className="px-4 py-3 text-xs text-neutral-400 text-center">لا توجد تعديلات بعد</li>
          )}
        </ul>
      )}

      {askName && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-[#7a0020] mb-1">ما اسمك؟</h3>
            <p className="text-[11px] text-neutral-500 mb-3">يُسجَّل مع كل تعديل في سجل الإجراء.</p>
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
    </main>
  );
}

/* ── view blocks ─────────────────────────────────────────────── */

function Badge({ status }: { status: string }) {
  const done = status === "done";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 ${
        done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {done ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />}
      {done ? "مكتمل" : "مسودة"}
    </span>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <div>
      <h3 className="text-[11px] font-bold text-[#7a0020] uppercase tracking-wider mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function BlockList({ title, items, numbered }: { title: string; items: string[]; numbered?: boolean }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-[11px] font-bold text-[#7a0020] uppercase tracking-wider mb-1.5">{title}</h3>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-neutral-800 leading-relaxed">
            <span className="shrink-0 text-[#c9a84c] font-bold w-4 text-center">
              {numbered ? i + 1 : "•"}
            </span>
            <span className="whitespace-pre-wrap">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── edit fields ─────────────────────────────────────────────── */

function Text({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className="w-full mt-0.5 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020]"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full mt-0.5 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020] leading-relaxed"
      />
    </label>
  );
}

function List({
  label,
  items,
  onChange,
  numbered,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  numbered?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-[10px] text-[#7a0020] font-bold flex items-center gap-1 hover:underline"
        >
          <Plus size={12} /> إضافة
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1 items-start">
            <span className="text-[10px] text-neutral-400 w-4 text-center pt-2">
              {numbered ? i + 1 : "•"}
            </span>
            <textarea
              value={item}
              rows={1}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none resize-y"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-neutral-400 hover:text-red-600 px-1 pt-2"
              aria-label="remove"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────── */

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
