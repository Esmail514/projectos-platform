"use client";

import React from "react";
import { Language, translations } from "@/lib/i18n";
import { User } from "@/types";
import { Globe, Shield, BookOpen, Bell, LogIn, LogOut, Users, UserCheck } from "lucide-react";

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAlerts: () => void;
  onOpenDocs: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Navbar({
  lang,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenAlerts,
  onOpenDocs,
  currentUser,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  const t = translations[lang];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "ADMIN":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "DEVELOPER":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "VIEWER":
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return t.superAdmin;
      case "ADMIN":
        return t.admin;
      case "DEVELOPER":
        return t.developer;
      case "VIEWER":
        return t.viewer;
      default:
        return role || "Guest";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border bg-cyber-dark/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyber-accent to-cyber-glow shadow-lg shadow-cyber-accent/30 cursor-pointer" onClick={() => onTabChange("projects")}>
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange("projects")}>
              <span className="text-lg font-bold tracking-tight text-white">ProjectOS</span>
              <span className="rounded-full bg-cyber-accent/20 px-2 py-0.5 text-xs font-semibold text-cyber-glow border border-cyber-accent/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Center / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server Healthy Indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Server Live</span>
          </div>

          {/* Quick Users Control Link if has permission */}
          {currentUser && currentUser.permissions?.manage_users && (
            <button
              onClick={() => onTabChange("usersControl")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "usersControl"
                  ? "border-purple-500 bg-purple-500/20 text-purple-200"
                  : "border-cyber-border bg-cyber-card text-slate-300 hover:border-purple-500/50 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 text-purple-400" />
              <span className="hidden sm:inline">{t.usersControl}</span>
            </button>
          )}

          {/* API Docs Button */}
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 rounded-lg border border-cyber-border bg-cyber-card px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyber-accent hover:text-white transition-colors"
          >
            <BookOpen className="h-4 w-4 text-cyber-glow" />
            <span className="hidden sm:inline">{t.apiDocs}</span>
          </button>

          {/* Alert Settings */}
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 rounded-lg border border-cyber-border bg-cyber-card px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyber-accent hover:text-white transition-colors"
          >
            <Bell className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">{t.settings}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 rounded-lg border border-cyber-accent/40 bg-cyber-accent/10 px-3 py-1.5 text-xs font-semibold text-cyber-glow hover:bg-cyber-accent/20 transition-all"
          >
            <Globe className="h-4 w-4" />
            <span>{t.switchLanguage}</span>
          </button>

          {/* User Profile / Auth Action */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-cyber-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 text-cyber-glow font-bold text-xs uppercase">
                  {currentUser.name ? currentUser.name.slice(0, 2) : "U"}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser.name || currentUser.email}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border w-fit mt-0.5 ${getRoleBadge(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                title={t.logout}
                className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyber-accent to-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyber-accent/25 hover:from-sky-500 hover:to-cyber-accent transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
