"use client";

import React from "react";
import { Language, translations } from "@/lib/i18n";
import { FolderGit2, Database, Activity, FileText, Users, Shield } from "lucide-react";
import { User } from "@/types";

interface SidebarProps {
  lang: Language;
  activeTab: string;
  onTabChange: (tab: string) => void;
  projectsCount: number;
  currentUser: User | null;
}

export function Sidebar({ lang, activeTab, onTabChange, projectsCount, currentUser }: SidebarProps) {
  const t = translations[lang];

  const canManageUsers = !currentUser || currentUser.permissions?.manage_users || currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";

  const items = [
    {
      id: "projects",
      label: t.projects,
      icon: FolderGit2,
      badge: projectsCount,
    },
    {
      id: "tables",
      label: t.tables,
      icon: Database,
    },
    {
      id: "observability",
      label: t.observability,
      icon: Activity,
      badgeColor: "bg-emerald-500/20 text-emerald-400",
    },
    {
      id: "logs",
      label: t.liveLogs,
      icon: FileText,
    },
    ...(canManageUsers
      ? [
          {
            id: "usersControl",
            label: t.usersControl,
            icon: Users,
            badge: "RBAC",
            badgeColor: "bg-purple-500/20 text-purple-300",
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-cyber-border bg-cyber-dark/50 p-4">
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyber-accent to-sky-600 text-white shadow-md shadow-cyber-accent/20"
                  : "text-slate-400 hover:bg-cyber-card hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.badgeColor || (isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400")
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Permissions Context Box in Sidebar Footer */}
      {currentUser && (
        <div className="mt-8 rounded-2xl border border-cyber-border bg-cyber-card/40 p-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-cyber-glow font-semibold mb-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>{t.permissions}</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>SQL Query:</span>
              <span className={currentUser.permissions?.execute_sql ? "text-emerald-400 font-bold" : "text-red-400"}>
                {currentUser.permissions?.execute_sql ? "Allowed" : "Blocked"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Write Data:</span>
              <span className={currentUser.permissions?.write_records ? "text-emerald-400 font-bold" : "text-red-400"}>
                {currentUser.permissions?.write_records ? "Allowed" : "Blocked"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Alter Schema:</span>
              <span className={currentUser.permissions?.manage_schema ? "text-emerald-400 font-bold" : "text-red-400"}>
                {currentUser.permissions?.manage_schema ? "Allowed" : "Blocked"}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
