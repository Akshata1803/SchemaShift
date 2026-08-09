"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

interface BlastRadiusBannerProps {
  sentence?: string;
  dangerScore: number;
}

export const BlastRadiusBanner: React.FC<BlastRadiusBannerProps> = ({
  sentence,
  dangerScore,
}) => {
  if (!sentence) return null;

  const isSafe = dangerScore < 30;
  const isWarning = dangerScore >= 30 && dangerScore < 60;
  const isDangerous = dangerScore >= 60;

  const bgGradient = isSafe
    ? "from-emerald-500/10 via-sage-green/10 to-teal-500/5 border-emerald-500/30"
    : isWarning
    ? "from-amber-500/15 via-clay-peach/15 to-orange-500/5 border-amber-500/40"
    : "from-rose-500/15 via-brick-dusty/15 to-red-500/5 border-rose-500/40";

  const textColor = isSafe
    ? "text-emerald-800"
    : isWarning
    ? "text-amber-900"
    : "text-rose-900";

  const badgeColor = isSafe
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : isWarning
    ? "bg-amber-100 text-amber-900 border-amber-300"
    : "bg-rose-100 text-rose-900 border-rose-300";

  return (
    <div className={`p-5 rounded-2xl border bg-gradient-to-r ${bgGradient} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-glass transition-all`}>
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 p-2 rounded-xl bg-white/80 shadow-sm border border-white/60">
          {isSafe && <ShieldCheck className="w-6 h-6 text-emerald-600" />}
          {isWarning && <AlertTriangle className="w-6 h-6 text-amber-600" />}
          {isDangerous && <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-forest-ink/70">
              Blast Radius Impact Analysis
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {isSafe ? "LOW RISK" : isWarning ? "MODERATE RISK" : "CRITICAL RISK"}
            </span>
          </div>
          <p className={`text-sm font-medium leading-relaxed ${textColor}`}>
            {sentence}
          </p>
        </div>
      </div>

      {/* Danger Score Numeric Gauge Circle */}
      <div className="flex items-center gap-3 bg-white/80 px-4 py-2.5 rounded-xl border border-white/80 shadow-sm shrink-0 self-end md:self-auto">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#E2E8F0"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke={isSafe ? "#10B981" : isWarning ? "#F59E0B" : "#EF4444"}
              strokeWidth="3.5"
              strokeDasharray={100}
              strokeDashoffset={100 - dangerScore}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute font-mono text-xs font-bold text-forest-ink">
            {dangerScore}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-forest-ink/60 font-mono">Danger Index</span>
          <span className="text-xs font-bold text-forest-ink">
            {dangerScore}/100 Score
          </span>
        </div>
      </div>
    </div>
  );
};

