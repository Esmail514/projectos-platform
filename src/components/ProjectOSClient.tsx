"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { Project, TableSchema, User } from "@/types";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ProjectsDashboard } from "@/components/ProjectsDashboard";
import { SchemaDesigner } from "@/components/SchemaDesigner";
import { DataGrid } from "@/components/DataGrid";
import { ObservabilityCenter } from "@/components/ObservabilityCenter";
import { LiveLogsViewer } from "@/components/LiveLogsViewer";
import { AlertSettingsModal } from "@/components/AlertSettingsModal";
import { APIDocumentationModal } from "@/components/APIDocumentationModal";
import { AuthModal } from "@/components/AuthModal";
import { UserManagementView } from "@/components/UserManagementView";
import { Plus, Database, Terminal, Play, FolderGit2, Lock, ShieldAlert } from "lucide-react";

export default function ProjectOSClient() {
  const [lang, setLang] = useState<Language>("ar");
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
  const [showSchemaDesigner, setShowSchemaDesigner] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // SQL Query Execution State
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM TableSchema LIMIT 10;");
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

  const t = translations[lang];

  // Fetch Current User
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser({ ...data.user, permissions: data.permissions });
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      if (activeTab === "usersControl") {
        setActiveTab("projects");
      }
    } catch {}
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/v1/projects");
      const json = await res.json();
      if (json.success && json.projects) {
        setProjects(json.projects);
        if (!selectedProject && json.projects.length > 0) {
          setSelectedProject(json.projects[0]);
          if (json.projects[0].tables && json.projects[0].tables.length > 0) {
            setSelectedTable(json.projects[0].tables[0]);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchProjects();
  }, []);

  // Sync html dir on language change
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof document !== "undefined") {
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLang;
    }
  };

  const canExecuteSql = !currentUser || currentUser.permissions?.execute_sql !== false;
  const canManageSchema = !currentUser || currentUser.permissions?.manage_schema !== false;

  const handleRunSQL = async () => {
    if (!selectedProject || !canExecuteSql) return;
    setSqlLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${selectedProject.id}/sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const data = await res.json();
      setSqlResult(data);
    } catch (err: any) {
      setSqlResult({ success: false, error: err.message });
    } finally {
      setSqlLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-darker text-slate-100 font-sans">
      {/* Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAlerts={() => setShowAlertModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          lang={lang}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          projectsCount={projects.length}
          currentUser={currentUser}
        />

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {activeTab === "projects" && (
            <ProjectsDashboard
              lang={lang}
              projects={projects}
              currentUser={currentUser}
              onSelectProject={(p) => {
                setSelectedProject(p);
                if (p.tables && p.tables.length > 0) {
                  setSelectedTable(p.tables[0]);
                } else {
                  setSelectedTable(null);
                }
                setActiveTab("tables");
              }}
              onRefresh={fetchProjects}
            />
          )}

          {activeTab === "tables" && (
            <div className="space-y-6">
              {/* Project Context Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-cyber-border bg-cyber-card/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyber-accent/20 p-2.5 text-cyber-glow">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">{t.projectName}</span>
                    <select
                      value={selectedProject?.id || ""}
                      onChange={(e) => {
                        const found = projects.find((p) => p.id === e.target.value);
                        if (found) {
                          setSelectedProject(found);
                          setSelectedTable(found.tables?.[0] || null);
                        }
                      }}
                      className="block text-sm font-bold text-white bg-transparent border-0 focus:outline-none cursor-pointer"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-cyber-dark text-white">
                          {p.name} ({p.dbType.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedProject && (
                  canManageSchema ? (
                    <button
                      onClick={() => setShowSchemaDesigner(true)}
                      className="flex items-center gap-2 rounded-xl bg-cyber-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyber-accent/20 hover:bg-sky-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t.addTable}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-cyber-dark px-3 py-1.5 text-xs text-slate-400">
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Permission Required (manage_schema)</span>
                    </div>
                  )
                )}
              </div>

              {/* Table Selector Tabs */}
              {selectedProject && selectedProject.tables && selectedProject.tables.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-cyber-border pb-3 overflow-x-auto">
                    {selectedProject.tables.map((tbl) => (
                      <button
                        key={tbl.id}
                        onClick={() => setSelectedTable(tbl)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                          selectedTable?.id === tbl.id
                            ? "bg-cyber-accent text-white shadow-md shadow-cyber-accent/30"
                            : "bg-cyber-card text-slate-400 hover:text-white"
                        }`}
                      >
                        <Database className="h-3.5 w-3.5" />
                        <span>{tbl.displayName || tbl.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Table Data Grid */}
                  {selectedTable && (
                    <DataGrid
                      lang={lang}
                      project={selectedProject}
                      table={selectedTable}
                      currentUser={currentUser}
                      onRefresh={fetchProjects}
                    />
                  )}

                  {/* Direct SQL Engine Section */}
                  <div className="rounded-2xl border border-cyber-border bg-cyber-card/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-cyber-glow" />
                        <h3 className="text-sm font-bold text-white">{t.directSQL}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {!canExecuteSql && (
                          <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md">
                            <ShieldAlert className="h-3 w-3" />
                            <span>Read-Only User: SQL Execution Restricted</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">PostgREST Speed Engine</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="SELECT * FROM ...;"
                        className="flex-1 rounded-xl border border-cyber-border bg-cyber-darker p-3 text-xs font-mono text-emerald-400 focus:border-cyber-accent focus:outline-none"
                      />
                      <button
                        onClick={handleRunSQL}
                        disabled={sqlLoading || !canExecuteSql}
                        className={`flex flex-col items-center justify-center rounded-xl px-5 text-xs font-bold text-white shadow-lg transition-all ${
                          canExecuteSql
                            ? "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500"
                            : "bg-slate-700 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {canExecuteSql ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        <span className="mt-1">{sqlLoading ? "..." : t.runQuery}</span>
                      </button>
                    </div>

                    {sqlResult && (
                      <div className="rounded-xl border border-cyber-border bg-cyber-darker p-3 font-mono text-xs overflow-x-auto max-h-48">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2 border-b border-slate-800 pb-1">
                          <span>
                            {t.executionTime}: {sqlResult.durationMs || 0}ms
                          </span>
                          <span>Rows: {sqlResult.rowsCount || 0}</span>
                        </div>
                        <pre className="text-slate-300">
                          {JSON.stringify(sqlResult.rows || sqlResult.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cyber-border bg-cyber-dark/30 p-12 text-center">
                  <Database className="h-12 w-12 text-slate-600" />
                  <h3 className="mt-4 text-base font-semibold text-slate-300">{t.noTablesFound}</h3>
                  {selectedProject && canManageSchema && (
                    <button
                      onClick={() => setShowSchemaDesigner(true)}
                      className="mt-4 flex items-center gap-1.5 rounded-xl bg-cyber-accent px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t.addTable}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "observability" && <ObservabilityCenter lang={lang} />}

          {activeTab === "logs" && <LiveLogsViewer lang={lang} />}

          {activeTab === "usersControl" && (
            <UserManagementView lang={lang} currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Schema Designer Modal */}
      {showSchemaDesigner && selectedProject && (
        <SchemaDesigner
          lang={lang}
          project={selectedProject}
          currentUser={currentUser}
          onTableCreated={() => {
            fetchProjects();
          }}
          onClose={() => setShowSchemaDesigner(false)}
        />
      )}

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        lang={lang}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />

      {/* API Documentation Modal */}
      <APIDocumentationModal
        lang={lang}
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        lang={lang}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          fetchCurrentUser();
        }}
      />
    </div>
  );
}
