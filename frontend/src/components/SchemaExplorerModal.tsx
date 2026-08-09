"use client";

import React, { useEffect, useState } from "react";
import { Database, X, Table, Copy, Check, Info } from "lucide-react";

interface SchemaExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet?: (sql: string) => void;
}

export const SchemaExplorerModal: React.FC<SchemaExplorerModalProps> = ({
  isOpen,
  onClose,
  onInsertSnippet,
}) => {
  const [schema, setSchema] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("users");
  const [copiedCol, setCopiedCol] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !schema) {
      fetch("/api/sandbox/schema")
        .then((res) => res.json())
        .then((data) => setSchema(data))
        .catch((e) => console.error("Failed to load schema:", e));
    }
  }, [isOpen, schema]);

  if (!isOpen) return null;

  const currentTable = schema?.tables?.find((t: any) => t.name === activeTab) || schema?.tables?.[0];

  const handleCopyColumn = (colName: string) => {
    navigator.clipboard.writeText(colName);
    setCopiedCol(colName);
    setTimeout(() => setCopiedCol(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl rounded-2xl border border-sage-green/40 overflow-hidden bg-sage-mist/95">
        {/* Header */}
        <div className="p-4 border-b border-sage-green/20 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sage-green" />
            <h3 className="font-serif text-lg font-bold text-forest-ink">
              Synthetic Schema & Data Explorer
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
        <div className="p-5 overflow-y-auto flex flex-col gap-4 flex-1">
          <p className="text-xs text-forest-ink/75">
            PostgreSQL tables automatically seeded into disposable test containers with up to 100,000 Faker rows.
          </p>

          {/* Table Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-sage-green/20 pb-2">
            {schema?.tables?.map((table: any) => (
              <button
                key={table.name}
                onClick={() => setActiveTab(table.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === table.name
                    ? "bg-sage-green text-white shadow-sm font-semibold"
                    : "bg-white/60 text-forest-ink hover:bg-white"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                {table.name}
                <span className="text-[10px] opacity-75">({table.rowCount})</span>
              </button>
            ))}
          </div>

          {currentTable && (
            <div className="flex flex-col gap-4">
              {/* Columns Table */}
              <div>
                <h4 className="text-xs font-bold text-forest-ink/80 uppercase tracking-wider mb-2">
                  Columns & Indexes
                </h4>
                <div className="overflow-x-auto rounded-xl border border-sage-green/30 bg-white/70">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-sage-green/20 text-forest-ink/60 bg-sage-mist/40 font-mono">
                        <th className="py-2 px-3">Column</th>
                        <th className="py-2 px-3">Data Type</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-green/10 font-mono">
                      {currentTable.columns.map((col: any) => (
                        <tr key={col.name} className="hover:bg-sage-green/10">
                          <td className="py-2 px-3 font-semibold text-forest-ink">{col.name}</td>
                          <td className="py-2 px-3 text-sage-green">{col.type}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleCopyColumn(col.name)}
                              className="text-[11px] text-forest-ink/60 hover:text-sage-green inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedCol === col.name ? <Check className="w-3 h-3 text-sage-green" /> : <Copy className="w-3 h-3" />}
                              {copiedCol === col.name ? "Copied" : "Copy"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Rows Preview */}
              <div>
                <h4 className="text-xs font-bold text-forest-ink/80 uppercase tracking-wider mb-2">
                  Sample Data Rows Preview
                </h4>
                <pre className="font-mono text-xs p-3 bg-[#1e1e1e] text-emerald-400 rounded-xl overflow-x-auto border border-sage-green/30 max-h-40">
                  {JSON.stringify(currentTable.sampleRows, null, 2)}
                </pre>
              </div>

              {/* Quick SQL Generator */}
              {onInsertSnippet && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onInsertSnippet(`SELECT * FROM ${currentTable.name} LIMIT 50;`);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-sage-green text-white hover:bg-forest-light transition-all shadow-sm cursor-pointer"
                  >
                    Insert `SELECT * FROM {currentTable.name}` into Editor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
