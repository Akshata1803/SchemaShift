"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { Play, Sparkles, Database, Code2, Zap, AlertTriangle, Layers, ShieldCheck, Trash2 } from "lucide-react";

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onTestMigration: () => void;
  isLoading: boolean;
  targetSeedRows: number;
  onTargetSeedRowsChange: (rows: number) => void;
}

const TEMPLATES = [
  {
    label: "Unindexed Query",
    icon: Zap,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Triggers sequential scan over ~50,000 synthetic rows",
    sql: `SELECT * FROM orders \nWHERE total_amount > 150.00 \n  AND status = 'completed';`,
  },
  {
    label: "Exclusive Lock",
    icon: AlertTriangle,
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    description: "ALTER TABLE with DEFAULT forces full table rewrite & locks",
    sql: `ALTER TABLE users \nADD COLUMN bio TEXT DEFAULT 'Software Engineer';`,
  },
  {
    label: "Unindexed JOIN",
    icon: Layers,
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
    description: "Nested loop scan during multi-table join",
    sql: `SELECT u.email, u.full_name, o.order_number, o.total_amount \nFROM users u \nJOIN orders o ON u.id = o.user_id \nWHERE u.status = 'active';`,
  },
  {
    label: "Safe Migration",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Index creation using CONCURRENTLY modifier",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status \nON orders(status);`,
  },
];

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onTestMigration,
  isLoading,
  targetSeedRows,
  onTargetSeedRowsChange,
}) => {
  const lineCount = value.split("\n").length;
  const charCount = value.length;

  return (
    <div className="glass-card p-6 shadow-terrarium flex flex-col gap-4 border border-sage-green/30">
      {/* Header controls & scale selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-green/20 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sage-green/15 text-sage-dark border border-sage-green/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-forest-ink font-bold leading-tight">SQL Migration Editor</h2>
            <p className="text-[11px] text-forest-ink/60">Type or select a template migration script to test in isolation</p>
          </div>
        </div>

        {/* Synthetic Seed Scale Selector */}
        <div className="flex items-center gap-2 bg-white/80 px-3.5 py-2 rounded-xl border border-sage-green/30 text-xs shadow-sm">
          <Database className="w-4 h-4 text-sage-dark" />
          <span className="text-forest-ink font-semibold">Synthetic Dataset:</span>
          <select
            value={targetSeedRows}
            onChange={(e) => onTargetSeedRowsChange(Number(e.target.value))}
            className="bg-transparent text-forest-ink font-mono font-bold cursor-pointer focus:outline-none"
          >
            <option value={10000}>10,000 Rows</option>
            <option value={50000}>50,000 Rows</option>
            <option value={100000}>100,000 Rows</option>
          </select>
        </div>
      </div>

      {/* Quick Scenario Templates */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-forest-ink/70 font-mono font-semibold uppercase tracking-wider">
          Preset Test Scenarios:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATES.map((tpl, idx) => {
            const IconComp = tpl.icon;
            return (
              <button
                key={idx}
                onClick={() => onChange(tpl.sql)}
                className="px-3 py-2 rounded-xl text-xs bg-white/70 hover:bg-white hover:border-sage-green/50 text-forest-ink border border-sage-green/25 transition-all shadow-sm flex flex-col items-start gap-1 group text-left cursor-pointer"
                title={tpl.description}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-forest-ink group-hover:text-sage-dark flex items-center gap-1.5">
                    <IconComp className="w-3.5 h-3.5 text-sage-dark" />
                    {tpl.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monaco SQL Editor Frame with Dark Accent */}
      <div className="relative rounded-2xl border-2 border-slate-800/80 overflow-hidden shadow-2xl bg-[#1e1e1e] group">
        <Editor
          height="220px"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "JetBrains Mono",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            padding: { top: 14, bottom: 14 },
          }}
        />

        {/* Editor Footer Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#181818] border-t border-gray-800 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span>Lines: {lineCount}</span>
            <span>Chars: {charCount}</span>
            <span className="text-emerald-400">PostgreSQL Syntax</span>
          </div>

          <button
            onClick={() => onChange("")}
            className="hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px]"
            title="Clear Editor"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-forest-ink/75 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sage-dark animate-pulse" />
          Container will be provisioned & destroyed cleanly after execution.
        </span>

        <button
          onClick={onTestMigration}
          disabled={isLoading || !value.trim()}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sage-dark to-forest-light hover:from-forest-light hover:to-forest-deep disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-98 cursor-pointer border border-white/20"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Sealing Dome & Testing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-emerald-300" />
              Test Migration Script
            </>
          )}
        </button>
      </div>
    </div>
  );
};

