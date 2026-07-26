import type { Metadata } from "next";
import {
  Almarai,
  Amiri,
  Cairo,
  El_Messiri,
  IBM_Plex_Sans_Arabic,
  Markazi_Text,
  Playfair_Display,
  Readex_Pro,
  Reem_Kufi,
  Tajawal,
} from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700", "800", "900"],
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const messiri = El_Messiri({
  variable: "--font-messiri",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const reem = Reem_Kufi({
  variable: "--font-reem",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const markazi = Markazi_Text({
  variable: "--font-markazi",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const FONT_CLASSES = [
  cairo.variable,
  tajawal.variable,
  plex.variable,
  readex.variable,
  amiri.variable,
  messiri.variable,
  reem.variable,
  markazi.variable,
  almarai.variable,
  playfair.variable,
].join(" ");

export const metadata: Metadata = {
  title: "دليل إجراءات دائرة الشؤون المالية | SQU",
  description:
    "Procedures directory for the SQU Financial Affairs Department — documented per section, with full edit history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${FONT_CLASSES} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-100">{children}</body>
    </html>
  );
}
