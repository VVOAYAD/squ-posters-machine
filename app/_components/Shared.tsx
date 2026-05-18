"use client";

import { Plus, Trash2 } from "lucide-react";

export const TopStrip = () => (
  <div className="pc-strip">
    <svg width="1000" height="34" viewBox="0 0 1000 34" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="34" fill="#7a0020" />
      <defs>
        <pattern id="hexc" x="0" y="0" width="50" height="34" patternUnits="userSpaceOnUse">
          <path d="M 0,9 L 7,3 L 37,3 L 44,9 L 37,15 L 7,15 Z" fill="none" stroke="#c9a84c" strokeWidth="1.6" />
          <path d="M 4,9 L 9,5 L 35,5 L 40,9 L 35,13 L 9,13 Z" fill="none" stroke="#c9a84c" strokeWidth="0.7" opacity="0.5" />
          <polygon points="44,9 47,6 50,9 47,12" fill="#c9a84c" />
          <path d="M 0,25 L 7,19 L 37,19 L 44,25 L 37,31 L 7,31 Z" fill="none" stroke="#c9a84c" strokeWidth="1.6" />
          <path d="M 4,25 L 9,21 L 35,21 L 40,25 L 35,29 L 9,29 Z" fill="none" stroke="#c9a84c" strokeWidth="0.7" opacity="0.5" />
          <polygon points="44,25 47,22 50,25 47,28" fill="#c9a84c" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1000" height="34" fill="url(#hexc)" />
    </svg>
  </div>
);

export const BottomStrip = () => (
  <div className="pc-strip">
    <svg width="1000" height="20" viewBox="0 0 1000 20" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="0" x2="1000" y2="0" stroke="#c9a84c" strokeWidth="2" opacity="0.65" />
      <rect width="1000" height="20" fill="#c9a84c" opacity="0.06" />
      <defs>
        <pattern id="botpat" x="0" y="0" width="18" height="20" patternUnits="userSpaceOnUse">
          <rect x="2" y="2" width="8" height="8" fill="#c9a84c" opacity="0.8" transform="rotate(45,6,6)" />
          <rect x="11" y="4" width="4" height="4" fill="#7a0020" opacity="0.55" transform="rotate(45,13,6)" />
          <rect x="2" y="13" width="4" height="4" fill="#7a0020" opacity="0.35" transform="rotate(45,4,15)" />
          <rect x="11" y="13" width="4" height="4" fill="#7a0020" opacity="0.35" transform="rotate(45,13,15)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1000" height="20" fill="url(#botpat)" />
    </svg>
  </div>
);

export function PosterHeader() {
  return (
    <div className="pc-header">
      <TopStrip />
      <div className="pc-header-main">
        <div className="pc-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sqi-finance-logo.png" alt="SQU Financial Affairs" />
        </div>
      </div>
      <BottomStrip />
    </div>
  );
}

export function PosterFooter({
  phones,
  email,
  meta,
  rtl,
}: {
  phones: string;
  email: string;
  meta: string;
  rtl: boolean;
}) {
  return (
    <div className="pc-footer">
      <div className="pc-fi">
        <div className="pc-ficon">☎</div>
        <span>{phones}</span>
      </div>
      <div className="pc-fmeta" style={{ direction: rtl ? "rtl" : "ltr" }}>
        {meta}
      </div>
      <div className="pc-fi">
        <span>{email}</span>
        <div className="pc-ficon">✉</div>
      </div>
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
  toggle,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  toggle?: { on: boolean; set: (v: boolean) => void };
}) {
  return (
    <div className="border-b border-neutral-200 pb-4 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[11px] font-bold text-[#7a0020] uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[10px] text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
        {toggle && (
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={toggle.on}
              onChange={(e) => toggle.set(e.target.checked)}
              className="accent-[#7a0020]"
            />
            <span className="text-neutral-600">show</span>
          </label>
        )}
      </div>
      {(!toggle || toggle.on) && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export function Field({
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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className="w-full mt-0.5 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020]"
      />
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  dir,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        rows={rows}
        className="w-full mt-0.5 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none focus:ring-1 focus:ring-[#7a0020] leading-relaxed"
      />
    </label>
  );
}

export function RowList({
  label,
  items,
  onChange,
  dir,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
        <button
          onClick={() => onChange([...items, ""])}
          className="text-[10px] text-[#7a0020] font-bold flex items-center gap-1 hover:underline"
          type="button"
        >
          <Plus size={12} /> add
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1 items-center">
            <span className="text-[10px] text-neutral-400 w-4 text-center">{i + 1}</span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              dir={dir}
              className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none"
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-neutral-400 hover:text-red-600 px-1"
              aria-label="remove"
              type="button"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
