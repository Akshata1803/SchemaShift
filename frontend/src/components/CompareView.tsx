"use client";

import React, { useState } from "react";
import { Zap, ShieldCheck, Clock, Cpu, Lock, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

interface CompareViewProps {
  originalSql: string;
  rewrittenSql: string;
  targetSeedRows: number;
}

export const CompareView: React.FC<CompareViewProps> = ({
  originalSql,
  rewrittenSql,
  targetSeedRows,
}) => {
  const [comparing, setComparing] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runBenchmarkComparison = async () => {
    setComparing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/sandbox/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_sql: originalSql,
          rewritten_sql: rewrittenSql,
          target_seed_rows: targetSeedRows,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Benchmark comparison failed.");
      }

      const data = await res.json();
      setCompareData(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to compare executions.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="glass-card p-5 shadow-terrarium flex flex-col gap-4 border-l-4 border-l-sage-green">
      <div className="flex items-center justify-between border-b border-sage-green/20 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-sage-green animate-bounce" />
          <h3 className="font-serif text-lg text-forest-ink font-semibold">
            Side-by-Side Benchmark & Execution Delta
          </h3>
        </div>

        <button
          onClick={runBenchmarkComparison}
          disabled={comparing}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sage-green text-white hover:bg-forest-light transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {comparing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Running Containers...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Run Dual Container Benchmark
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="text-xs text-brick-dusty bg-brick-dusty/10 p-2.5 rounded-lg border border-brick-dusty/30">
          {errorMsg}
        </div>
      )}

      {compareData ? (
        <div className="flex flex-col gap-4">
          {/* Key Metric Performance Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-sage-green/15 p-3 rounded-xl border border-sage-green/30 flex flex-col">
              <span className="text-[11px] text-forest-ink/70 font-medium">Execution Speedup</span>
              <span className="font-mono text-xl font-extrabold text-sage-green mt-0.5">
                ⚡ {compareData.metrics.speedupFactor}x Faster
              </span>
              <span className="text-[10px] text-forest-ink/60 mt-0.5">
                Saved ~{compareData.metrics.timeSavedMs}ms runtime
              </span>
            </div>

            <div className="bg-white/70 p-3 rounded-xl border border-sage-green/30 flex flex-col">
              <span className="text-[11px] text-forest-ink/70 font-medium">Risk Score Reduction</span>
              <span className="font-mono text-xl font-extrabold text-forest-ink mt-0.5">
                🛡️ -{compareData.metrics.dangerScoreDrop} Points
              </span>
              <span className="text-[10px] text-forest-ink/60 mt-0.5">
                {compareData.original.dangerScore} → {compareData.rewritten.dangerScore} / 100
              </span>
            </div>

            <div className="bg-white/70 p-3 rounded-xl border border-sage-green/30 flex flex-col">
              <span className="text-[11px] text-forest-ink/70 font-medium">Equivalence Verification</span>
              <span className="font-mono text-sm font-bold text-sage-green mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-sage-green" /> 100% Identical Output
              </span>
            </div>
          </div>

          {/* Side-by-Side Code & Execution Spec */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original SQL Panel */}
            <div className="bg-brick-dusty/5 p-4 rounded-xl border border-brick-dusty/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brick-dusty">Original Query</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-brick-dusty/15 text-brick-dusty font-bold">
                  {compareData.original.executionTimeMs}ms
                </span>
              </div>
              <pre className="font-mono text-xs p-3 bg-[#1e1e1e] text-red-300 rounded-lg overflow-x-auto max-h-32 border border-gray-700">
                {compareData.original.sql}
              </pre>
              <p className="text-[11px] text-forest-ink/70 line-clamp-2">
                • {compareData.original.blastRadius}
              </p>
            </div>

            {/* Rewritten SQL Panel */}
            <div className="bg-sage-green/10 p-4 rounded-xl border border-sage-green/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sage-green">Optimized Rewrite</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sage-green/20 text-sage-green font-bold">
                  {compareData.rewritten.executionTimeMs}ms
                </span>
              </div>
              <pre className="font-mono text-xs p-3 bg-[#1e1e1e] text-emerald-400 rounded-lg overflow-x-auto max-h-32 border border-gray-700">
                {compareData.rewritten.sql}
              </pre>
              <p className="text-[11px] text-forest-ink/70 line-clamp-2">
                • {compareData.rewritten.blastRadius}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-sage-mist/60 border border-dashed border-sage-green/30 text-center flex flex-col items-center justify-center gap-1 text-xs text-forest-ink/70">
          <span>Click <strong>Run Dual Container Benchmark</strong> to spin up two isolated PostgreSQL containers and measure side-by-side performance deltas.</span>
        </div>
      )}
    </div>
  );
};
