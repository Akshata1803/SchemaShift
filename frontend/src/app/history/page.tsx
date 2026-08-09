"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { History, LineChart, ShieldCheck, AlertTriangle, AlertOctagon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TestHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [histRes, trendRes] = await Promise.all([
        fetch("/api/history"),
        fetch("/api/history/trends"),
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }
      if (trendRes.ok) {
        const trendData = await trendRes.json();
        setTrends(trendData);
      }
    } catch (e: any) {
      setFetchError(e?.message || "Failed to connect to the backend. Make sure it is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-forest-ink/70 hover:text-sage-green font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sandbox Engine
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl text-forest-ink font-bold tracking-tight">
            Migration Test History & Danger Score Trends
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/70 hover:bg-white text-forest-ink border border-sage-green/30 shadow-sm transition-all cursor-pointer"
        >
          Refresh History
        </button>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-brick-dusty/10 border border-brick-dusty/40 text-brick-dusty text-sm font-medium flex items-center justify-between">
          <span>⚠ {fetchError}</span>
          <button onClick={() => setFetchError(null)} className="text-xs underline hover:text-forest-ink">Dismiss</button>
        </div>
      )}

      {/* Danger Score Timeline Trend Chart */}
      <div className="glass-card p-6 shadow-terrarium flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-sage-green/20 pb-3">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-sage-green" />
            <h2 className="font-serif text-lg text-forest-ink font-semibold">
              Danger Score Trends Over Time
            </h2>
          </div>
          <span className="text-xs text-forest-ink/60 font-mono">
            Scale: 0 (Safe) to 100 (High Lock Risk)
          </span>
        </div>

        {trends.length > 0 ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9776A" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6B8F71" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 143, 113, 0.2)" />
                <XAxis dataKey="timestamp" stroke="#22301F" fontSize={11} tickLine={false} />
                <YAxis stroke="#22301F" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    borderColor: "rgba(107, 143, 113, 0.3)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="danger_score"
                  stroke="#D9776A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#dangerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-forest-ink/60 font-mono">
            No historical trend points recorded yet. Run a migration test to see analytics.
          </div>
        )}
      </div>

      {/* Test Runs History Log */}
      <div className="glass-card p-6 shadow-terrarium flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-sage-green/20 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sage-green" />
            <h2 className="font-serif text-lg text-forest-ink font-semibold">
              Recent Sandbox Executions
            </h2>
          </div>
          <span className="text-xs text-forest-ink/60 font-mono">
            {history.length} Test Runs Recorded
          </span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-forest-ink border-collapse">
              <thead>
                <tr className="border-b border-sage-green/20 text-forest-ink/60 font-medium">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 font-mono">Run ID</th>
                  <th className="py-3 px-3">SQL Submitted</th>
                  <th className="py-3 px-3">Danger Score</th>
                  <th className="py-3 px-3">Runtime</th>
                  <th className="py-3 px-3">Production Blast Radius</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-green/10">
                {history.map((run) => (
                  <tr key={run.run_id} className="hover:bg-white/40 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          run.status === "safe"
                            ? "bg-sage-green/20 text-sage-dark"
                            : run.status === "warning"
                            ? "bg-clay-peach/20 text-forest-ink"
                            : "bg-brick-dusty/20 text-brick-dusty"
                        }`}
                      >
                        {run.status === "safe" && <ShieldCheck className="w-3 h-3" />}
                        {run.status === "warning" && <AlertTriangle className="w-3 h-3" />}
                        {run.status === "dangerous" && <AlertOctagon className="w-3 h-3" />}
                        {run.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-forest-ink/70">
                      {run.run_id}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-forest-ink max-w-xs truncate">
                      {run.sql}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sm">
                      <span
                        className={
                          run.danger_score >= 60
                            ? "text-brick-dusty"
                            : run.danger_score >= 30
                            ? "text-clay-peach"
                            : "text-sage-green"
                        }
                      >
                        {run.danger_score}
                      </span>
                      <span className="text-forest-ink/40 text-[10px]">/100</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-forest-ink/80">
                      {run.execution_time_ms}ms
                    </td>
                    <td className="py-3 px-3 text-forest-ink/80 max-w-md line-clamp-1">
                      {run.blast_radius || run.danger_reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-forest-ink/60">
            No migrations tested yet — paste one in the sandbox engine to see it run safely.
          </div>
        )}
      </div>
    </div>
  );
}
