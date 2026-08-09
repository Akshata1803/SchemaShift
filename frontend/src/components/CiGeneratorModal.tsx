"use client";

import React, { useState } from "react";
import { Code2, X, Copy, Check, Download } from "lucide-react";

interface CiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CiGeneratorModal: React.FC<CiGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const githubActionsYaml = `name: SchemaShift Migration Safety CI Check

on:
  pull_request:
    paths:
      - 'migrations/**.sql'
      - 'db/migrations/**.sql'

jobs:
  schemashift-sandbox-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run Isolated SchemaShift Container Check
        uses: schemashift/action-postgres-sandbox@v1
        with:
          migrations_dir: './migrations'
          synthetic_rows: 50000
          max_danger_score: 50
`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(githubActionsYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([githubActionsYaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schemashift-ci.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl flex flex-col shadow-2xl rounded-2xl border border-sage-green/40 overflow-hidden bg-sage-mist/95">
        {/* Header */}
        <div className="p-4 border-b border-sage-green/20 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sage-green" />
            <h3 className="font-serif text-lg font-bold text-forest-ink">
              GitHub Actions CI/CD Pipeline Generator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-forest-ink/70 hover:bg-sage-green/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-forest-ink/75">
            Add this ready-to-use GitHub Actions workflow file to your repository at <code className="font-mono bg-sage-green/15 px-1.5 py-0.5 rounded text-sage-dark">.github/workflows/schemashift-ci.yml</code> to automate SQL migration checks on every Pull Request.
          </p>

          <pre className="font-mono text-xs p-4 bg-[#1e1e1e] text-emerald-400 rounded-xl overflow-x-auto border border-sage-green/30 max-h-64">
            {githubActionsYaml}
          </pre>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDownloadYaml}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/80 hover:bg-white text-forest-ink border border-sage-green/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download .yml File
            </button>

            <button
              onClick={handleCopyYaml}
              className="px-5 py-2 rounded-xl text-xs font-medium bg-sage-green text-white hover:bg-forest-light transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied to Clipboard!" : "Copy Workflow YAML"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
