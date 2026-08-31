"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  CircleDashed,
  CornerDownLeft,
  GripVertical,
  Plus,
} from "lucide-react";
import { createProcedure, moveProcedure } from "../_lib/actions";
import { getEditorName, rememberEditorName } from "../_lib/editor-name";
import type { ProcedureRow } from "../_lib/db";

export default function ProcedureList({
  slug,
  procedures,
}: {
  slug: string;
  procedures: ProcedureRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Which row currently has its "move to #" box open, and what's typed in it.
  const [moving, setMoving] = useState<number | null>(null);
  const [target, setTarget] = useState("");

  // Name prompt — an insert needs a name, a move does not.
  const [askName, setAskName] = useState<{ position?: number } | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  const count = procedures.length;

  function move(id: number, to: number) {
    if (to < 1 || to > count) return;
    setMoving(null);
    start(async () => {
      await moveProcedure(slug, id, to);
      router.refresh();
    });
  }

  function add(position: number | undefined, editor: string) {
    rememberEditorName(editor);
    start(() => {
      createProcedure(slug, editor, position);
    });
  }

  function askThenAdd(position?: number) {
    const saved = getEditorName();
    if (saved) return add(position, saved);
    setNameDraft("");
    setAskName({ position });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-neutral-400">
          {count > 1 && "استخدم الأسهم لتغيير الترتيب، أو اضغط الرقم للنقل إلى موضع محدد"}
        </p>
        <button
          onClick={() => askThenAdd(undefined)}
          disabled={pending}
          className="flex items-center gap-1.5 bg-[#7a0020] text-white text-sm font-bold rounded-md px-4 py-2 hover:bg-[#9b1535] transition-colors disabled:opacity-50"
        >
          <Plus size={15} />
          {pending ? "..." : "إضافة إجراء"}
        </button>
      </div>

      {count === 0 ? (
        <div className="bg-white border border-dashed border-[#e2d0c8] rounded-lg py-14 text-center">
          <p className="text-sm text-neutral-500">لا توجد إجراءات مسجّلة بعد</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            اضغط «إضافة إجراء» لتسجيل أول إجراء في هذا القسم
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {procedures.map((p, i) => (
            <li key={p.id}>
              {/* insert-above slot */}
              <InsertHere
                label={`إضافة إجراء هنا (يصبح رقم ${i + 1})`}
                onClick={() => askThenAdd(i + 1)}
                disabled={pending}
              />

              <div className="group flex items-stretch gap-0 bg-white border border-[#e2d0c8] rounded-lg hover:border-[#7a0020] hover:shadow-sm transition-all overflow-hidden">
                {/* reorder controls */}
                <div className="flex flex-col justify-center border-l border-neutral-100 bg-neutral-50/60 px-1">
                  <button
                    onClick={() => move(p.id, i)}
                    disabled={i === 0 || pending}
                    title="تحريك لأعلى"
                    className="text-neutral-400 hover:text-[#7a0020] disabled:opacity-25 disabled:hover:text-neutral-400 p-0.5"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => move(p.id, i + 2)}
                    disabled={i === count - 1 || pending}
                    title="تحريك لأسفل"
                    className="text-neutral-400 hover:text-[#7a0020] disabled:opacity-25 disabled:hover:text-neutral-400 p-0.5"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* number — click to type a destination */}
                {moving === p.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const n = Number(target);
                      if (Number.isInteger(n)) move(p.id, n);
                    }}
                    className="flex items-center gap-1 px-2 shrink-0"
                  >
                    <input
                      autoFocus
                      value={target}
                      onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
                      onBlur={() => setMoving(null)}
                      placeholder={String(i + 1)}
                      className="w-11 text-center text-sm font-bold border border-[#7a0020] rounded py-1 outline-none"
                      title={`اكتب رقماً من 1 إلى ${count}`}
                    />
                    <button type="submit" className="text-[#7a0020]" title="نقل">
                      <CornerDownLeft size={13} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setTarget("");
                      setMoving(p.id);
                    }}
                    disabled={pending}
                    title="نقل إلى موضع محدد"
                    className="shrink-0 w-11 flex items-center justify-center"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#7a0020]/8 text-[#7a0020] font-bold text-sm flex items-center justify-center hover:bg-[#7a0020] hover:text-white transition-colors">
                      {p.number}
                    </span>
                  </button>
                )}

                <Link
                  href={`/section/${slug}/${p.id}`}
                  className="flex-1 min-w-0 flex items-center gap-4 px-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] text-[#1c1c1c] group-hover:text-[#7a0020] truncate">
                      {p.title_ar || "إجراء بدون عنوان"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {p.updated_by ? `آخر تعديل: ${p.updated_by} · ${fmt(p.updated_at)}` : "لم يُعدَّل بعد"}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                  <GripVertical size={14} className="text-neutral-200 shrink-0" />
                  <ChevronLeft size={16} className="text-neutral-300 group-hover:text-[#7a0020] shrink-0" />
                </Link>
              </div>
            </li>
          ))}

          <li>
            <InsertHere
              label={`إضافة إجراء في النهاية (يصبح رقم ${count + 1})`}
              onClick={() => askThenAdd(undefined)}
              disabled={pending}
            />
          </li>
        </ol>
      )}

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
                  const pos = askName.position;
                  setAskName(null);
                  add(pos, nameDraft.trim());
                }
              }}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020]"
              placeholder="الاسم الكامل"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (!nameDraft.trim()) return;
                  const pos = askName.position;
                  setAskName(null);
                  add(pos, nameDraft.trim());
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
    </>
  );
}

/** A thin hover-to-reveal strip between rows for inserting at that exact slot. */
function InsertHere({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="group/ins w-full h-4 flex items-center gap-2 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity disabled:pointer-events-none"
    >
      <span className="h-px flex-1 bg-[#7a0020]/30" />
      <span className="flex items-center gap-1 text-[10px] font-bold text-[#7a0020] whitespace-nowrap">
        <Plus size={10} />
        {label}
      </span>
      <span className="h-px flex-1 bg-[#7a0020]/30" />
    </button>
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
  return new Date(ts).toLocaleDateString("ar-OM", { year: "numeric", month: "short", day: "numeric" });
}
