"use client";

import React, { useState } from "react";
import { SqlEditor } from "@/components/SqlEditor";
import { TerrariumJar, TerrariumState } from "@/components/TerrariumJar";
import { ExplainPlanViewer } from "@/components/ExplainPlanViewer";
import { AiOptimizerCard } from "@/components/AiOptimizerCard";
import { RollbackCard } from "@/components/RollbackCard";
import { BlastRadiusBanner } from "@/components/BlastRadiusBanner";
import { CompareView } from "@/components/CompareView";
import { SchemaExplorerModal } from "@/components/SchemaExplorerModal";
import { ReportExportModal } from "@/components/ReportExportModal";
import { CiGeneratorModal } from "@/components/CiGeneratorModal";
import { Terminal, ShieldCheck, Database, FileDown, Code2, Sparkles, Cpu, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

export default function SandboxDashboard() {
  const [sql, setSql] = useState<string>(
    `SELECT * FROM orders \nWHERE total_amount > 150.00 \n  AND status = 'completed';`
  );
  const [targetSeedRows, setTargetSeedRows] = useState<number>(10000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [terrariumState, setTerrariumState] = useState<TerrariumState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isSchemaOpen, setIsSchemaOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isCiOpen, setIsCiOpen] = useState<boolean>(false);

  const handleTestMigration = async () => {
    if (!sql.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setTerrariumState("sealing");

    // Give visual dome seal moment
    setTimeout(() => {
      setTerrariumState("running");
    }, 400);

    try {
      const response = await fetch("/api/sandbox/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: sql.trim(),
          target_seed_rows: targetSeedRows,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || errJson.message || "Sandbox container execution failed.");
      }

      const data = await response.json();
      setTestResult(data);

      if (data.danger_score >= 60) {
        setTerrariumState("dangerous");
      } else if (data.danger_score >= 30) {
        setTerrariumState("warning");
      } else {
        setTerrariumState("safe");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute migration test.");
      setTerrariumState("failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-sage-green/10 blur-3xl pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute top-80 right-10 w-80 h-80 rounded-full bg-clay-peach/10 blur-3xl pointer-events-none -z-10 animate-float-delayed" />

      {/* Hero Intro Banner with Action Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 shadow-terrarium flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-sage-green/30"
      >
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sage-green/20 text-sage-dark font-mono text-[11px] font-bold uppercase tracking-wider border border-sage-green/30">
              PostgreSQL 16 Sandbox Engine
            </span>
            <span className="text-xs text-forest-ink/60 font-mono">Teardown Guaranteed</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-forest-ink font-bold tracking-tight leading-tight">
            Isolated SQL Sandbox & Terrarium
          </h1>
          <p className="text-sm text-forest-ink/80 mt-2 leading-relaxed">
            Measure performance benchmarks, lock risks, and blast radius impact inside disposable PostgreSQL containers before touching production infrastructure.
          </p>
        </div>

        {/* Feature Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
          <button
            onClick={() => setIsSchemaOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-forest-ink border border-sage-green/30 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-sage-green" />
            Schema Explorer
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            disabled={!testResult}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-forest-ink border border-sage-green/30 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-sage-green" />
            Export PR Report
          </button>

          <button
            onClick={() => setIsCiOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sage-green text-white hover:bg-forest-light shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            GitHub Actions CI
          </button>
        </div>
      </motion.div>

      {/* Main Grid: SQL Editor (Left) & Animated Terrarium Jar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          <SqlEditor
            value={sql}
            onChange={setSql}
            onTestMigration={handleTestMigration}
            isLoading={isLoading}
            targetSeedRows={targetSeedRows}
            onTargetSeedRowsChange={setTargetSeedRows}
          />
        </motion.div>

        {/* Animated Terrarium Jar Visual Identity Card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-5 flex flex-col"
        >
          <TerrariumJar
            state={terrariumState}
            dangerScore={testResult?.danger_score || 0}
            dangerReason={testResult?.danger_reason}
            executionTimeMs={testResult?.execution_time_ms}
          />
        </motion.div>
      </div>

      {/* Execution Error Banner */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-brick-dusty/15 border border-brick-dusty/40 text-brick-dusty text-sm font-medium flex items-center justify-between shadow-sm"
        >
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs underline hover:text-forest-ink font-semibold"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Results Section */}
      {testResult ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          {/* Blast Radius Plain-English Impact Sentence */}
          <BlastRadiusBanner
            sentence={testResult.blast_radius_sentence}
            dangerScore={testResult.danger_score}
          />

          {/* AI Query Optimization & Safety Layer */}
          <AiOptimizerCard
            aiRewrite={testResult.ai_rewrite}
            onApplyRewrite={(rewritten) => setSql(rewritten)}
          />

          {/* Side-by-Side Dual Container Benchmark Comparison */}
          {testResult.ai_rewrite?.rewritten_sql && (
            <CompareView
              originalSql={sql}
              rewrittenSql={testResult.ai_rewrite.rewritten_sql}
              targetSeedRows={targetSeedRows}
            />
          )}

          {/* Execution Plan Tree & Benchmarks */}
          <ExplainPlanViewer
            explainJsonStr={testResult.explain_plan_json}
            executionTimeMs={testResult.execution_time_ms}
            locksDetectedStr={testResult.locks_detected}
            seedRowsCount={targetSeedRows}
          />

          {/* Migration Rollback Generator (DOWN script) */}
          <RollbackCard rollbackSql={testResult.rollback_sql} />
        </motion.div>
      ) : (
        /* Empty State with plain-english developer invitation */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-10 text-center flex flex-col items-center justify-center gap-3 border-dashed border-sage-green/40 shadow-terrarium my-2"
        >
          <div className="w-14 h-14 rounded-2xl bg-sage-green/15 flex items-center justify-center text-sage-dark mb-1 shadow-sm border border-sage-green/30">
            <Terminal className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl text-forest-ink font-bold">
            Ready to Test Migration Script
          </h3>
          <p className="text-xs text-forest-ink/75 max-w-md leading-relaxed">
            Select a preset scenario above or paste your custom SQL script to analyze lock risk, buffer reads, and blast radius inside a disposable glass terrarium container.
          </p>
        </motion.div>
      )}

      {/* Feature Modals */}
      <SchemaExplorerModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
        onInsertSnippet={(snippet) => setSql(snippet)}
      />

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        testResult={testResult}
      />

      <CiGeneratorModal
        isOpen={isCiOpen}
        onClose={() => setIsCiOpen(false)}
      />
    </div>
  );
}
