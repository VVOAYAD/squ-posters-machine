export type FontKey =
  | "cairo"
  | "tajawal"
  | "plex"
  | "readex"
  | "amiri"
  | "messiri"
  | "reem"
  | "markazi"
  | "almarai";

export type FontOption = {
  key: FontKey;
  label: string;
  /** Family name as Word/docx expects it */
  docxFamily: string;
  /** CSS variable name set on <html> by next/font */
  cssVar: string;
  /** Short note shown in the picker */
  hint: string;
};

export const FONTS: FontOption[] = [
  { key: "cairo",   label: "Cairo",                docxFamily: "Cairo",                cssVar: "--font-cairo",   hint: "Modern · default · حديث" },
  { key: "tajawal", label: "Tajawal",              docxFamily: "Tajawal",              cssVar: "--font-tajawal", hint: "Clean · readable" },
  { key: "plex",    label: "IBM Plex Sans Arabic", docxFamily: "IBM Plex Sans Arabic", cssVar: "--font-plex",    hint: "Professional · enterprise" },
  { key: "readex",  label: "Readex Pro",           docxFamily: "Readex Pro",           cssVar: "--font-readex",  hint: "Geometric · contemporary" },
  { key: "almarai", label: "Almarai",              docxFamily: "Almarai",              cssVar: "--font-almarai", hint: "Friendly · soft" },
  { key: "messiri", label: "El Messiri",           docxFamily: "El Messiri",           cssVar: "--font-messiri", hint: "Elegant · refined" },
  { key: "reem",    label: "Reem Kufi",            docxFamily: "Reem Kufi",            cssVar: "--font-reem",    hint: "Kufic · bold · headlines" },
  { key: "markazi", label: "Markazi Text",         docxFamily: "Markazi Text",         cssVar: "--font-markazi", hint: "Serif · literary" },
  { key: "amiri",   label: "Amiri",                docxFamily: "Amiri",                cssVar: "--font-amiri",   hint: "Classical Naskh · formal" },
];

export const FONT_BY_KEY: Record<FontKey, FontOption> = Object.fromEntries(
  FONTS.map((f) => [f.key, f]),
) as Record<FontKey, FontOption>;

export type SizeKey = "xs" | "sm" | "md" | "lg" | "xl";

export type SizeOption = {
  key: SizeKey;
  label: string;
  value: number;
};

export const SIZES: SizeOption[] = [
  { key: "xs", label: "XS",  value: 0.85 },
  { key: "sm", label: "S",   value: 0.92 },
  { key: "md", label: "M",   value: 1.0  },
  { key: "lg", label: "L",   value: 1.12 },
  { key: "xl", label: "XL",  value: 1.25 },
];

export const SIZE_BY_KEY: Record<SizeKey, SizeOption> = Object.fromEntries(
  SIZES.map((s) => [s.key, s]),
) as Record<SizeKey, SizeOption>;

export type Align = "left" | "center" | "right" | "justify";

/** Clamp size scale into the supported range (50%–200%). */
export function clampSize(scale: number): number {
  if (Number.isNaN(scale)) return 1;
  return Math.max(0.5, Math.min(2.0, Math.round(scale * 100) / 100));
}
