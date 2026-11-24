"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { Project, ColumnSchema, User } from "@/types";
import { Plus, Trash2, Save, X, Database, Sparkles, Lock } from "lucide-react";

interface Props {
  lang: Language;
  project: Project;
  onTableCreated: () => void;
  onClose: () => void;
  currentUser?: User | null;
}

export function SchemaDesigner({ lang, project, onTableCreated, onClose, currentUser }: Props) {
  const t = translations[lang];
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<ColumnSchema[]>([
    { name: "title", displayName: "Title", type: "string", isRequired: true },
    { name: "price", displayName: "Price", type: "number", isRequired: false },
    { name: "is_active", displayName: "Is Active", type: "boolean", isRequired: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageSchema = !currentUser || currentUser.permissions?.manage_schema !== false;

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { name: `field_${columns.length + 1}`, displayName: `Field ${columns.length + 1}`, type: "string", isRequired: false },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, idx) => idx !== index));
  };

  const handleColumnChange = (index: number, key: keyof ColumnSchema, value: any) => {
    const updated = [...columns];
    (updated[index] as any)[key] = value;
    setColumns(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !canManageSchema) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          displayName: displayName || name,
          description,
          columns,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onTableCreated();
        onClose();
      } else {
        setError(data.error || "Failed to create table");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyber-glow" />
            <h2 className="text-lg font-bold text-white">{t.addTable}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">{t.tableName} (DB Identifier)</label>
              <input
                type="text"
                required
                placeholder="e.g. products"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                  if (!displayName) setDisplayName(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-xs font-mono text-white focus:border-cyber-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">{t.tableDisplayName}</label>
              <input
                type="text"
                placeholder="e.g. المنتجات / Products"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-xs text-white focus:border-cyber-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <input
              type="text"
              placeholder="Description of the entity and endpoints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-xs text-slate-300 focus:border-cyber-accent focus:outline-none"
            />
          </div>

          {/* Dynamic Columns Configurator */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{t.columns}</span>
              <button
                type="button"
                onClick={handleAddColumn}
                className="flex items-center gap-1 text-xs font-semibold text-cyber-glow hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.addColumn}</span>
              </button>
            </div>

            <div className="space-y-2">
              {columns.map((col, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-xl border border-cyber-border bg-cyber-darker p-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Field name"
                    value={col.name}
                    onChange={(e) => handleColumnChange(idx, "name", e.target.value)}
                    className="flex-1 rounded-lg border border-cyber-border bg-cyber-card px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Display name"
                    value={col.displayName || ""}
                    onChange={(e) => handleColumnChange(idx, "displayName", e.target.value)}
                    className="flex-1 rounded-lg border border-cyber-border bg-cyber-card px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <select
                    value={col.type}
                    onChange={(e) => handleColumnChange(idx, "type", e.target.value)}
                    className="rounded-lg border border-cyber-border bg-cyber-card px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="string">String (Text)</option>
                    <option value="number">Number (Float/Int)</option>
                    <option value="boolean">Boolean</option>
                    <option value="json">JSON Object</option>
                    <option value="datetime">DateTime</option>
                  </select>
                  <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={col.isRequired}
                      onChange={(e) => handleColumnChange(idx, "isRequired", e.target.checked)}
                      className="rounded border-cyber-border bg-cyber-card text-cyber-accent focus:ring-0"
                    />
                    <span>Required</span>
                  </label>
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyber-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {t.cancel}
            </button>
            {canManageSchema ? (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyber-accent to-sky-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyber-accent/25 hover:from-sky-500 hover:to-cyber-accent transition-all"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "..." : t.saveTable}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-cyber-card px-4 py-2 text-xs text-amber-400 font-medium">
                <Lock className="h-4 w-4" />
                <span>Permission Required (manage_schema)</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
