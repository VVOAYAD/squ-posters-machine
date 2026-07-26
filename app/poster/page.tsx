"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  FileDown,
  FileText,
  LayoutGrid,
  ListChecks,
  Minus,
  Plus,
  Type,
} from "lucide-react";
import CircularEditor from "../_components/CircularEditor";
import PosterEditor from "../_components/PosterEditor";
import { Align, FONTS, FontKey, FONT_BY_KEY, clampSize } from "../_components/fonts";

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

function Divider() {
  return <div className="w-px h-5 bg-white/15" />;
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

function NumericSize({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  const step = (delta: number) => onChange(clampSize((pct + delta) / 100));
  return (
    <div className="flex items-center bg-black/30 rounded-md text-xs overflow-hidden">
      <button
        onClick={() => step(-5)}
        className="px-1.5 py-1 text-white/70 hover:text-white hover:bg-black/30"
        title="Decrease size"
      >
        <Minus size={11} />
      </button>
      <input
        type="number"
        value={pct}
        min={50}
        max={200}
        step={1}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clampSize(n / 100));
        }}
        className="w-10 bg-transparent text-center text-white outline-none border-l border-r border-white/10 py-1 font-bold tabular-nums"
        title="Font size %"
      />
      <span className="text-white/40 text-[10px] pr-1.5">%</span>
      <button
        onClick={() => step(5)}
        className="px-1.5 py-1 text-white/70 hover:text-white hover:bg-black/30"
        title="Increase size"
      >
        <Plus size={11} />
      </button>
      <button
        onClick={() => onChange(1)}
        className={`px-1.5 py-1 text-[10px] font-bold ${
          pct === 100 ? "text-white/30" : "text-[#c9a84c] hover:text-[#e8c55a]"
        }`}
        title="Reset to 100%"
      >
        ↺
      </button>
    </div>
  );
}

function AlignPicker({
  value,
  onChange,
}: {
  value: Align;
  onChange: (v: Align) => void;
}) {
  const opts: { key: Align; icon: React.ReactNode; title: string }[] = [
    { key: "left",    icon: <AlignLeft size={12} />,    title: "Align left" },
    { key: "center",  icon: <AlignCenter size={12} />,  title: "Center" },
    { key: "right",   icon: <AlignRight size={12} />,   title: "Align right" },
    { key: "justify", icon: <AlignJustify size={12} />, title: "Justify (default)" },
  ];
  return (
    <div className="flex bg-black/30 rounded-md p-0.5 text-xs">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          title={o.title}
          className={`px-1.5 py-1 rounded transition-colors ${
            value === o.key ? "bg-[#c9a84c] text-[#500015]" : "text-white/70 hover:text-white"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
