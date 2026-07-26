"use client";

import { useRef, useState } from "react";
import { Download, FileText } from "lucide-react";
import { LangHint, type Lang } from "./Shared";
import {
  DEFAULTS,
  PosterFields,
  PosterPreview,
  exportDocx,
  exportPng,
  type PosterData,
} from "./poster-core";
import type { Align, FontOption } from "./fonts";

export default function PosterEditor({
  previewLang,
  font,
  sizeScale,
  bodyAlign,
  onBusy,
}: {
  previewLang: Lang;
  font: FontOption;
  sizeScale: number;
  bodyAlign: Align;
  onBusy: (s: string | null) => void;
}) {
  const [data, setData] = useState<PosterData>(DEFAULTS);
  const arRef = useRef<HTMLDivElement>(null);
  const enRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof PosterData>(key: K, val: PosterData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const toggleHide = (key: string) =>
    setData((d) => ({ ...d, hide: { ...d.hide, [key]: !d.hide[key] } }));

  const stamp = data.refValue.replace(/\//g, "-") || "poster";

  async function downloadPng(lang: Lang) {
    onBusy(`PNG ${lang.toUpperCase()}`);
    try {
      await exportPng(lang === "ar" ? arRef.current : enRef.current, `poster_${stamp}_${lang}.png`);
    } finally {
      onBusy(null);
    }
  }

  async function downloadDocx() {
    onBusy(".docx");
    try {
      await exportDocx(data, font, sizeScale, bodyAlign, `poster_${stamp}_text.docx`);
    } finally {
      onBusy(null);
    }
  }

  const previewStyle = {
    ["--font-poster" as string]: `var(${font.cssVar})`,
    ["--fs" as string]: sizeScale,
    ["--body-align" as string]: bodyAlign,
  };

  return (
    <div className="flex-1 grid grid-cols-[440px_1fr] overflow-hidden">
      <aside className="overflow-y-auto bg-white border-r border-neutral-200 p-5 space-y-5">
        <div className="flex gap-1.5 pb-3 border-b border-neutral-200 -mt-1">
          <button
            onClick={() => downloadPng("ar")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7a0020] hover:bg-[#500015] text-white font-bold text-xs px-2 py-2 rounded transition-colors"
          >
            <Download size={13} /> PNG عربي
          </button>
          <button
            onClick={() => downloadPng("en")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7a0020] hover:bg-[#500015] text-white font-bold text-xs px-2 py-2 rounded transition-colors"
          >
            <Download size={13} /> PNG English
          </button>
          <button
            onClick={downloadDocx}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#7a0020] hover:bg-[#fbfaf6] text-[#7a0020] font-bold text-xs px-2 py-2 rounded transition-colors"
          >
            <FileText size={13} /> .docx
          </button>
        </div>

        <LangHint lang={previewLang} />

        <PosterFields data={data} update={update} toggleHide={toggleHide} lang={previewLang} />
      </aside>

      <main className="overflow-auto p-6 bg-neutral-200 relative">
        <div className="flex flex-col items-center gap-4">
          <div className="text-[11px] text-neutral-500 tracking-widest uppercase">
            Live preview · {previewLang === "ar" ? "Arabic" : "English"} · {font.label} ·{" "}
            {Math.round(sizeScale * 100)}% · displayed at 65%
          </div>
          <div className="origin-top scale-[0.65] -mb-[35%]">
            <div ref={previewLang === "ar" ? arRef : enRef} style={previewStyle}>
              <PosterPreview data={data} lang={previewLang} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: -99999, top: 0 }} aria-hidden>
          <div ref={previewLang === "ar" ? enRef : arRef} style={previewStyle}>
            <PosterPreview data={data} lang={previewLang === "ar" ? "en" : "ar"} />
          </div>
        </div>
      </main>
    </div>
  );
}
