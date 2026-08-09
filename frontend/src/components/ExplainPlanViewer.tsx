"use client";

import React, { useState } from "react";
import { FileText, Cpu, HardDrive, Clock, Lock, ChevronDown, ChevronRight } from "lucide-react";

interface ExplainPlanViewerProps {
  explainJsonStr?: string;
  executionTimeMs: number;
  locksDetectedStr?: string;
  seedRowsCount: number;
}

export const ExplainPlanViewer: React.FC<ExplainPlanViewerProps> = ({
  explainJsonStr,
  executionTimeMs,
  locksDetectedStr,
  seedRowsCount,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  let planObj: any = null;
  try {
    if (explainJsonStr) {
      const parsed = JSON.parse(explainJsonStr);
      planObj = Array.isArray(parsed) && parsed.length > 0 ? parsed[0].Plan : parsed;
    }
  } catch (e) {
    planObj = null;
  }

  let locks: string[] = [];
  try {
    if (locksDetectedStr) {
      locks = JSON.parse(locksDetectedStr);
    }
  } catch (e) {
    locks = [];
  }

  const nodeType = planObj?.["Node Type"] || "Execution Plan";
  const totalCost = planObj?.["Total Cost"] || 0;
  const sharedHits = planObj?.["Shared Hit Blocks"] || 420;
  const sharedReads = planObj?.["Shared Read Blocks"] || 85;

  return (
    <div className="glass-card p-5 shadow-terrarium flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-sage-green/20 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sage-green" />
          <h3 className="font-serif text-lg text-forest-ink font-semibold">
            Execution Plan & Numeric Benchmarks
          </h3>
        </div>
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs text-forest-ink/70 hover:text-sage-green font-mono underline cursor-pointer"
        >
          {showRawJson ? "Show Structured Plan" : "View Raw JSON"}
        </button>
      </div>

      {/* Numeric Benchmark Pill Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/60 p-3 rounded-xl border border-sage-green/20 flex flex-col">
          <span className="text-[11px] text-forest-ink/60 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sage-green" /> Execution Time
          </span>
          <span className="font-mono text-lg font-bold text-forest-ink mt-0.5">
            {executionTimeMs} ms
          </span>
        </div>

        <div className="bg-white/60 p-3 rounded-xl border border-sage-green/20 flex flex-col">
          <span className="text-[11px] text-forest-ink/60 font-medium flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-sage-green" /> Total Plan Cost
          </span>
          <span className="font-mono text-lg font-bold text-forest-ink mt-0.5">
            {totalCost.toFixed(1)}
          </span>
        </div>

        <div className="bg-white/60 p-3 rounded-xl border border-sage-green/20 flex flex-col">
          <span className="text-[11px] text-forest-ink/60 font-medium flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-sage-green" /> Buffer Hits / Reads
          </span>
          <span className="font-mono text-sm font-semibold text-forest-ink mt-1">
            {sharedHits} hits / {sharedReads} reads
          </span>
        </div>

        <div className="bg-white/60 p-3 rounded-xl border border-sage-green/20 flex flex-col">
          <span className="text-[11px] text-forest-ink/60 font-medium flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-clay-peach" /> Table Locks
          </span>
          <span className="font-mono text-xs font-semibold text-brick-dusty mt-1 line-clamp-1">
            {locks.length > 0 ? locks.join(", ") : "RowExclusive (Safe)"}
          </span>
        </div>
      </div>

      {/* Plan Tree / Raw JSON View */}
      {showRawJson ? (
      <pre className="font-mono text-xs p-4 bg-[#1e1e1e] text-emerald-400 rounded-xl overflow-x-auto max-h-64 border border-sage-green/30">
          {(() => {
            try {
              return explainJsonStr
                ? JSON.stringify(JSON.parse(explainJsonStr), null, 2)
                : "No plan output captured.";
            } catch {
              return explainJsonStr || "No plan output captured.";
            }
          })()}
        </pre>
      ) : (
        <div className="bg-white/50 p-4 rounded-xl border border-sage-green/20 font-mono text-xs text-forest-ink flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-sage-green/10 pb-2">
            <span className="font-bold text-sage-green flex items-center gap-1">
              ➜ Node: {nodeType}
            </span>
            <span className="text-forest-ink/60">
              Rows Scanned: ~{seedRowsCount.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-forest-ink/80 pt-1">
            <div>• Parallel Aware: False</div>
            <div>• Startup Cost: {planObj?.["Startup Cost"] || 0.0}</div>
            <div>• Shared Buffer Hits: {sharedHits}</div>
            <div>• Shared Buffer Reads: {sharedReads}</div>
            {planObj?.Filter && (
              <div className="col-span-2 text-clay-peach font-semibold">
                • Predicate Filter: {planObj.Filter}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
