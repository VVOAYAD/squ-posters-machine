"use client";

import { useState } from "react";
import Link from "next/link";
import { FileDown, FileText, LayoutGrid, ListChecks } from "lucide-react";
import CircularEditor from "../_components/CircularEditor";
import PosterEditor from "../_components/PosterEditor";
import { AlignPicker, Divider, FontPicker, LangToggle, NumericSize } from "../_components/Toolbar";
import { Align, FontKey, FONT_BY_KEY } from "../_components/fonts";

type Mode = "tameem" | "poster";

export default function PosterMachine() {
  const [mode, setMode] = useState<Mode>("tameem");
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");
  const [fontKey, setFontKey] = useState<FontKey>("cairo");
  const [sizeScale, setSizeScale] = useState<number>(1);
  const [bodyAlign, setBodyAlign] = useState<Align>("justify");
  const [busy, setBusy] = useState<string | null>(null);

  const font = FONT_BY_KEY[fontKey];

  return (
    <div className="flex flex-col h-full">
      <header className="bg-[#500015] text-white px-5 py-2.5 flex items-center justify-between shadow z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#500015] font-black text-xs">
              SQU
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">SQU Posters Machine</h1>
              <p className="text-[10px] text-[#c9a84c] tracking-wider">CIRCULAR · POSTER · NEWS GENERATOR</p>
            </div>
          </div>

          <div className="flex bg-black/30 rounded-md p-0.5 text-xs ml-2">
            <ModeTab active={mode === "tameem"} onClick={() => setMode("tameem")} icon={<FileText size={12} />}>
              تعميم
            </ModeTab>
            <ModeTab active={mode === "poster"} onClick={() => setMode("poster")} icon={<LayoutGrid size={12} />}>
              Poster
            </ModeTab>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/25 rounded-md px-2.5 py-1.5 transition-colors shrink-0"
          >
            <ListChecks size={13} />
            دليل الإجراءات
          </Link>
          <Divider />
          <FontPicker fontKey={fontKey} onChange={setFontKey} />
          <Divider />
          <NumericSize value={sizeScale} onChange={setSizeScale} />
          <Divider />
          <AlignPicker value={bodyAlign} onChange={setBodyAlign} />
          <Divider />
          <LangToggle value={previewLang} onChange={setPreviewLang} />
        </div>
      </header>

      {mode === "tameem" ? (
        <CircularEditor
          previewLang={previewLang}
          font={font}
          sizeScale={sizeScale}
          bodyAlign={bodyAlign}
          onBusy={setBusy}
        />
      ) : (
        <PosterEditor
          previewLang={previewLang}
          font={font}
          sizeScale={sizeScale}
          bodyAlign={bodyAlign}
          onBusy={setBusy}
        />
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
function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
        active ? "bg-[#c9a84c] text-[#500015] font-bold" : "text-white/70 hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

