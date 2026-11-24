"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { Project, TableSchema, User } from "@/types";
import { Plus, Trash2, Terminal, Copy, Check, Lock, RefreshCw } from "lucide-react";

interface Props {
  lang: Language;
  project: Project;
  table: TableSchema;
  onRefresh: () => void;
  currentUser?: User | null;
}

export function DataGrid({ lang, project, table, onRefresh, currentUser }: Props) {
  const t = translations[lang];
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRowPayload, setNewRowPayload] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  const canWrite = !currentUser || currentUser.permissions?.write_records !== false;
  const canDelete = !currentUser || currentUser.permissions?.delete_records !== false;

  const apiEndpoint = `/api/v1/projects/${project.id}/${table.name}`;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoint);
      const json = await res.json();
      if (json.success && json.data) {
        setRows(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [project.id, table.name]);

  const handleCreateRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRowPayload),
      });
      if (res.ok) {
        setNewRowPayload({});
        setShowAddModal(false);
        fetchRecords();
      }
    } catch {}
  };

  const handleDeleteRow = async (id: string) => {
    if (!canDelete) return;
    try {
      const res = await fetch(`${apiEndpoint}?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRecords();
      }
    } catch {}
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(`${window.location.origin}${apiEndpoint}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Table Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-cyber-border bg-cyber-card/60 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{table.displayName || table.name}</h2>
            <span className="font-mono text-xs text-cyber-glow">({table.name})</span>
          </div>
          <p className="text-xs text-slate-400">
            {rows.length} {t.recordsCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Endpoint badge with Copy */}
          <button
            onClick={copyEndpoint}
            className="flex items-center gap-1.5 rounded-lg border border-cyber-border bg-cyber-dark px-3 py-1.5 text-xs text-slate-300 hover:border-cyber-accent"
          >
            <Terminal className="h-3.5 w-3.5 text-cyber-glow" />
            <span className="font-mono">{apiEndpoint}</span>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={fetchRecords}
            className="p-2 rounded-lg border border-cyber-border bg-cyber-dark text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {canWrite ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cyber-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyber-accent/20 hover:bg-sky-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.addRow}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-cyber-dark px-3 py-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-amber-500/70" />
              <span>Read-Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Virtual Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-cyber-border bg-cyber-dark/80">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cyber-border bg-cyber-card/80 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              {table.columns.map((col) => (
                <th key={col.id || col.name} className="px-4 py-3 font-semibold">
                  <div className="flex items-center gap-1">
                    <span>{col.displayName || col.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({col.type})</span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40 text-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={table.columns.length + 2} className="py-8 text-center text-slate-500">
                  No records yet. Insert your first row or call the auto-generated POST endpoint!
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-cyber-card/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{row.id.substring(0, 8)}...</td>
                  {table.columns.map((col) => (
                    <td key={col.name} className="px-4 py-3 font-medium">
                      {typeof row[col.name] === "boolean"
                        ? row[col.name]
                          ? "true"
                          : "false"
                        : String(row[col.name] ?? "-")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    {canDelete ? (
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600">Locked</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Row Modal */}
      {showAddModal && canWrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">{t.addRow}</h3>
            <form onSubmit={handleCreateRow} className="mt-4 space-y-4">
              {table.columns.map((col) => (
                <div key={col.name}>
                  <label className="text-xs font-semibold text-slate-300">
                    {col.displayName || col.name} {col.isRequired && "*"}
                  </label>
                  {col.type === "boolean" ? (
                    <select
                      onChange={(e) =>
                        setNewRowPayload({ ...newRowPayload, [col.name]: e.target.value === "true" })
                      }
                      className="mt-1 w-full rounded-lg border border-cyber-border bg-cyber-card px-3 py-2 text-xs text-white"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      type={col.type === "number" ? "number" : "text"}
                      required={col.isRequired}
                      onChange={(e) =>
                        setNewRowPayload({
                          ...newRowPayload,
                          [col.name]: col.type === "number" ? parseFloat(e.target.value) : e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-cyber-border bg-cyber-card px-3 py-2 text-xs text-white focus:border-cyber-accent focus:outline-none"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyber-accent px-5 py-2 text-xs font-bold text-white hover:bg-sky-500"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
