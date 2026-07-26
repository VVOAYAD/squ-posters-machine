"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  Type,
} from "lucide-react";
import { Align, FONTS, FontKey, FONT_BY_KEY, clampSize } from "./fonts";
import type { Lang } from "./Shared";

export function Divider() {
  return <div className="w-px h-5 bg-white/15" />;
}

export function FontPicker({
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

export function NumericSize({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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

export function AlignPicker({ value, onChange }: { value: Align; onChange: (v: Align) => void }) {
  const opts: { key: Align; icon: React.ReactNode; title: string }[] = [
    { key: "left", icon: <AlignLeft size={12} />, title: "Align left" },
    { key: "center", icon: <AlignCenter size={12} />, title: "Center" },
    { key: "right", icon: <AlignRight size={12} />, title: "Align right" },
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

export function LangToggle({ value, onChange }: { value: Lang; onChange: (v: Lang) => void }) {
  return (
    <div className="flex bg-black/30 rounded-md p-0.5 text-xs">
      {(["ar", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-3 py-1 rounded transition-colors ${
            value === l ? "bg-[#c9a84c] text-[#500015] font-bold" : "text-white/70 hover:text-white"
          }`}
        >
          {l === "ar" ? "عربي" : "English"}
        </button>
      ))}
    </div>
  );
}
