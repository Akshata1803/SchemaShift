"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, History, Code2, Server } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-sage-green/25 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Terrarium Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-green/30 to-sage-dark/20 border border-sage-green/40 flex items-center justify-center group-hover:scale-105 transition-all shadow-bloom">
            <Sprout className="w-5 h-5 text-sage-dark animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-forest-ink tracking-tight block leading-none">
                SchemaShift
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-green/15 text-sage-dark font-mono font-semibold border border-sage-green/30">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-forest-ink/60 font-mono tracking-wide block mt-0.5">
              Isolated PostgreSQL Sandbox & Terrarium
            </span>
          </div>
        </Link>

        {/* Live Engine Status Badge & Navigation */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white/80 px-3 py-1.5 rounded-full border border-sage-green/30 text-forest-ink shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-green"></span>
            </span>
            <Server className="w-3.5 h-3.5 text-sage-dark" />
            <span>Sandbox Engine Active</span>
          </div>

          <nav className="flex items-center gap-1.5" suppressHydrationWarning>
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/"
                  ? "bg-sage-green text-white shadow-md shadow-sage-green/20"
                  : "text-forest-ink/75 hover:bg-sage-green/10 hover:text-forest-ink"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Sandbox Engine
            </Link>

            <Link
              href="/history"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/history"
                  ? "bg-sage-green text-white shadow-md shadow-sage-green/20"
                  : "text-forest-ink/75 hover:bg-sage-green/10 hover:text-forest-ink"
              }`}
            >
              <History className="w-4 h-4" />
              History & Trends
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

