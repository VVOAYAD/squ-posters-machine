"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createProcedure } from "../_lib/actions";
import { getEditorName, rememberEditorName } from "../_lib/editor-name";

export default function AddProcedureButton({ slug }: { slug: string }) {
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");

  function go(editor: string) {
    rememberEditorName(editor);
    start(() => {
      createProcedure(slug, editor);
    });
  }

  function onClick() {
    const saved = getEditorName();
    if (saved) return go(saved);
    setName("");
    setAsking(true);
  }

  return (
    <>
      <button
        onClick={onClick}
        disabled={pending}
        className="flex items-center gap-1.5 bg-[#7a0020] text-white text-sm font-bold rounded-md px-4 py-2 hover:bg-[#9b1535] transition-colors disabled:opacity-50"
      >
        <Plus size={15} />
        {pending ? "جارٍ الإضافة..." : "إضافة إجراء"}
      </button>

      {asking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-lg shadow-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-[#7a0020] mb-1">ما اسمك؟</h3>
            <p className="text-[11px] text-neutral-500 mb-3">
              يُسجَّل مع كل تعديل حتى نعرف من قام بالتغيير.
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  setAsking(false);
                  go(name.trim());
                }
              }}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020]"
              placeholder="الاسم الكامل"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (!name.trim()) return;
                  setAsking(false);
                  go(name.trim());
                }}
                className="flex-1 bg-[#7a0020] text-white text-sm font-bold rounded-md py-2 hover:bg-[#9b1535]"
              >
                متابعة
              </button>
              <button
                onClick={() => setAsking(false)}
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
