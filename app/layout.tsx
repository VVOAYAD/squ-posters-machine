import type { Metadata } from "next";
import { Cairo, Playfair_Display } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

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
    <html lang="en" className={`${cairo.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-100">{children}</body>
    </html>
  );
}
