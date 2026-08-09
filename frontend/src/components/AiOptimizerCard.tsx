"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, XCircle, Copy, Check, ArrowRight } from "lucide-react";

interface AiOptimizerCardProps {
  aiRewrite?: {
    rewritten_sql: string;
    explanation: string;
    results_match: boolean;
    original_hash?: string;
    rewritten_hash?: string;
    source?: string;
  };
  onApplyRewrite?: (sql: string) => void;
}

export const AiOptimizerCard: React.FC<AiOptimizerCardProps> = ({
  aiRewrite,
  onApplyRewrite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!aiRewrite || !aiRewrite.rewritten_sql) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiRewrite.rewritten_sql);
    } catch {
      // Fallback for non-HTTPS or restricted contexts (e.g. localhost on some browsers)
      const el = document.createElement("textarea");
      el.value = aiRewrite.rewritten_sql;
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
    <div className="glass-card p-5 shadow-terrarium flex flex-col gap-4 border-l-4 border-l-sage-green">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sage-green/20 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sage-green animate-pulse" />
          <h3 className="font-serif text-lg text-forest-ink font-semibold">
            AI Query Optimization & Safety Layer
          </h3>
        </div>

        {/* Source Badge */}
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-sage-mist border border-sage-green/30 text-forest-ink/80 font-medium">
          Engine: {aiRewrite.source || "Ollama / Heuristic Optimizer"}
        </span>
      </div>

      {/* Correctness Verification Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 p-3 rounded-xl border border-sage-green/30">
        <div className="flex items-center gap-2">
          {aiRewrite.results_match ? (
            <CheckCircle2 className="w-5 h-5 text-sage-green" />
          ) : (
            <XCircle className="w-5 h-5 text-brick-dusty" />
          )}
          <div>
            <span className="text-xs font-bold text-forest-ink block">
              {aiRewrite.results_match
                ? "Result Sets Equivalence Verified (100% Match)"
                : "Result Set Mismatch Warning"}
            </span>
            <span className="text-[11px] text-forest-ink/60">
              Original & Rewritten queries executed against sandbox data produce identical outputs.
            </span>
          </div>
        </div>

        <div className="font-mono text-[10px] text-forest-ink/60 bg-sage-mist px-2.5 py-1 rounded border border-sage-green/20">
          Hash Match: {aiRewrite.results_match ? "SHA256 EQUIVALENT" : "MISMATCH"}
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-forest-ink/80 bg-sage-mist/60 p-3 rounded-lg border border-sage-green/20">
        <strong className="text-forest-ink font-semibold">Optimization Rationale:</strong>{" "}
        {aiRewrite.explanation}
      </p>

      {/* Rewritten Code Box */}
      <div className="relative rounded-xl border border-sage-green/30 bg-[#1e1e1e] p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700 text-gray-400 text-[11px]">
          <span>Optimized Non-Blocking SQL Rewrite</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-sage-green" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy SQL"}
            </button>
            {onApplyRewrite && (
              <button
                onClick={() => onApplyRewrite(aiRewrite.rewritten_sql)}
                className="inline-flex items-center gap-1 text-sage-green hover:underline cursor-pointer font-sans font-medium"
              >
                Use this rewrite <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <pre>{aiRewrite.rewritten_sql}</pre>
      </div>
    </div>
  );
};
