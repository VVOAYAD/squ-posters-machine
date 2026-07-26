import Link from "next/link";
import { LayoutGrid, ChevronLeft } from "lucide-react";

export default function SiteHeader({
  crumbs = [],
}: {
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <header className="bg-[#500015] text-white px-6 py-3 flex items-center justify-between shadow z-10 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#500015] font-black text-xs">
            SQU
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">دليل إجراءات دائرة الشؤون المالية</h1>
            <p className="text-[10px] text-[#c9a84c] tracking-wider">
              FINANCIAL AFFAIRS · PROCEDURES DIRECTORY
            </p>
          </div>
        </Link>

        {crumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-white/70 min-w-0" dir="rtl">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronLeft size={12} className="opacity-50 shrink-0" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-white truncate">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white truncate">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <Link
        href="/poster"
        className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/25 rounded-md px-3 py-1.5 transition-colors shrink-0"
      >
        <LayoutGrid size={13} />
        Posters Machine
      </Link>
    </header>
  );
}
