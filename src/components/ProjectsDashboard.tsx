"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { Project, User } from "@/types";
import { Plus, Database, FolderGit2, ArrowRight, ArrowLeft, Lock } from "lucide-react";

interface Props {
  lang: Language;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
  currentUser?: User | null;
}

export function ProjectsDashboard({ lang, projects, onSelectProject, onRefresh, currentUser }: Props) {
  const t = translations[lang];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [dbType, setDbType] = useState("postgresql");
  const [loading, setLoading] = useState(false);

  const canCreate = !currentUser || currentUser.permissions?.create_project !== false;
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, dbType }),
      });
      if (res.ok) {
        setName("");
        setSlug("");
        setDescription("");
        setShowCreateModal(false);
        onRefresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-cyber-border bg-gradient-to-r from-cyber-card via-cyber-dark to-cyber-card p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t.projects}</h1>
          <p className="mt-1 text-sm text-slate-400">{t.appSubtitle}</p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-accent to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyber-accent/25 hover:from-sky-500 hover:to-cyber-accent transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.createProject}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-cyber-border/80 bg-cyber-dark/50 px-3.5 py-2 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>Permission Required (create_project)</span>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cyber-border bg-cyber-dark/30 p-12 text-center">
          <FolderGit2 className="h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-base font-semibold text-slate-300">{t.noProjectsFound}</h3>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-xl border border-cyber-accent/30 bg-cyber-accent/10 px-4 py-2 text-xs font-semibold text-cyber-glow hover:bg-cyber-accent/20"
            >
              {t.createProject}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const tablesCount = proj.tables?.length || 0;
            return (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-cyber-border bg-cyber-card/70 p-5 shadow-lg backdrop-blur hover:border-cyber-accent hover:shadow-cyber-accent/10 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-md bg-cyber-accent/15 px-2.5 py-1 text-xs font-semibold text-cyber-glow border border-cyber-accent/20">
                      <Database className="h-3 w-3" />
                      {proj.dbType.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      {t.active}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyber-glow transition-colors">
                    {proj.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {proj.description || "Project workspace with automated DB endpoints & telemetry."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-cyber-border/60 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">{tablesCount}</span> {t.tables}
                  </div>
                  <button
                    onClick={() => onSelectProject(proj)}
                    className="flex items-center gap-1.5 rounded-lg bg-cyber-dark px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-cyber-accent hover:text-white transition-all"
                  >
                    <span>{t.openProject}</span>
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">{t.createProject}</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300">{t.projectName}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Analytics Engine"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">{t.projectSlug}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. analytics-engine"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">{t.dbEngine}</label>
                <select
                  value={dbType}
                  onChange={(e) => setDbType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                >
                  <option value="postgresql">PostgreSQL (Supabase Architecture)</option>
                  <option value="mysql">MySQL (Directus Architecture)</option>
                  <option value="sqlite">SQLite (Zero-Config High Speed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">{t.projectDescription}</label>
                <textarea
                  rows={2}
                  placeholder="Project purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-cyber-accent px-5 py-2 text-xs font-bold text-white hover:bg-sky-500 transition-all"
                >
                  {loading ? "..." : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
