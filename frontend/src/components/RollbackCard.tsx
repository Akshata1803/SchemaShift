"use client";

import React, { useState } from "react";
import { Undo2, Copy, Check } from "lucide-react";

interface RollbackCardProps {
  rollbackSql?: string;
}

export const RollbackCard: React.FC<RollbackCardProps> = ({ rollbackSql }) => {
  const [copied, setCopied] = useState(false);

  if (!rollbackSql) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rollbackSql);
    } catch {
      // Fallback for non-HTTPS or restricted contexts
      const el = document.createElement("textarea");
      el.value = rollbackSql;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 shadow-terrarium flex flex-col gap-3 border-l-4 border-l-clay-peach">
      <div className="flex items-center justify-between border-b border-sage-green/20 pb-3">
        <div className="flex items-center gap-2">
          <Undo2 className="w-5 h-5 text-clay-peach" />
          <h3 className="font-serif text-lg text-forest-ink font-semibold">
            Generated Migration Rollback Script (DOWN)
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-forest-ink/80 hover:text-sage-green font-mono transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-sage-green" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy Rollback SQL"}
        </button>
      </div>

      <p className="text-xs text-forest-ink/70">
        Template-generated safe reversing SQL script to restore state if migration deployment needs to be rolled back.
      </p>

      <div className="rounded-xl border border-sage-green/30 bg-[#1e1e1e] p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
        <pre>{rollbackSql}</pre>
      </div>
    </div>
  );
};
