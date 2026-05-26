"use client";

import { useState } from "react";
import { FileDown, FileText, LayoutGrid, Type } from "lucide-react";
import CircularEditor from "./_components/CircularEditor";
import PosterEditor from "./_components/PosterEditor";
import { FONTS, FontKey, FONT_BY_KEY, SIZES, SizeKey, SIZE_BY_KEY } from "./_components/fonts";

type Mode = "tameem" | "poster";

export default function Home() {
  const [mode, setMode] = useState<Mode>("tameem");
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");
  const [fontKey, setFontKey] = useState<FontKey>("cairo");
  const [sizeKey, setSizeKey] = useState<SizeKey>("md");
  const [busy, setBusy] = useState<string | null>(null);

  const font = FONT_BY_KEY[fontKey];
  const size = SIZE_BY_KEY[sizeKey];

  return (
    <div className="flex flex-col h-full">
      <header className="bg-[#500015] text-white px-6 py-3 flex items-center justify-between shadow z-10 gap-4">
        <div className="flex items-center gap-4">
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
          <FontPicker fontKey={fontKey} onChange={setFontKey} />
          <SizePicker sizeKey={sizeKey} onChange={setSizeKey} />

          <div className="flex bg-black/30 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setPreviewLang("ar")}
              className={`px-3 py-1 rounded transition-colors ${
                previewLang === "ar" ? "bg-[#c9a84c] text-[#500015] font-bold" : "text-white/70 hover:text-white"
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setPreviewLang("en")}
              className={`px-3 py-1 rounded transition-colors ${
                previewLang === "en" ? "bg-[#c9a84c] text-[#500015] font-bold" : "text-white/70 hover:text-white"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </header>

      {mode === "tameem" ? (
        <CircularEditor previewLang={previewLang} font={font} sizeScale={size.value} onBusy={setBusy} />
      ) : (
        <PosterEditor previewLang={previewLang} font={font} sizeScale={size.value} onBusy={setBusy} />
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

function FontPicker({
  fontKey,
  onChange,
}: {
  fontKey: FontKey;
  onChange: (key: FontKey) => void;
}) {
  const active = FONT_BY_KEY[fontKey];
  return (
    <label className="flex items-center gap-1.5 bg-black/30 hover:bg-black/40 rounded-md px-2 py-1 text-xs cursor-pointer transition-colors">
      <Type size={12} className="text-[#c9a84c]" />
      <select
        value={fontKey}
        onChange={(e) => onChange(e.target.value as FontKey)}
        className="bg-transparent text-white outline-none cursor-pointer pr-1"
        title={active.hint}
      >
        {FONTS.map((f) => (
          <option key={f.key} value={f.key} className="bg-[#500015] text-white">
            {f.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SizePicker({
  sizeKey,
  onChange,
}: {
  sizeKey: SizeKey;
  onChange: (key: SizeKey) => void;
}) {
  return (
    <div className="flex bg-black/30 rounded-md p-0.5 text-xs">
      {SIZES.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          title={`Font size ${s.label} · ${Math.round(s.value * 100)}%`}
          className={`px-2 py-1 rounded transition-colors font-bold ${
            sizeKey === s.key ? "bg-[#c9a84c] text-[#500015]" : "text-white/70 hover:text-white"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
