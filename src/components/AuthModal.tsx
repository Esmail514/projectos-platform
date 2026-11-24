"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { User } from "@/types";
import { X, Lock, Mail, User as UserIcon, Shield, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ lang, isOpen, onClose, onSuccess }: Props) {
  const t = translations[lang];
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register";
    const payload = isLogin ? { email, password } : { email, name, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed");
        return;
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl border border-cyber-border bg-cyber-dark p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-accent via-cyber-glow to-emerald-500"></div>

        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyber-accent/20 text-cyber-glow">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold text-white">
              {isLogin ? t.signIn : t.signUp}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-cyber-card p-1 text-xs font-semibold mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 rounded-lg py-2 transition-all ${
              isLogin ? "bg-cyber-accent text-white shadow-md shadow-cyber-accent/30" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 rounded-lg py-2 transition-all ${
              !isLogin ? "bg-cyber-accent text-white shadow-md shadow-cyber-accent/30" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.signUp}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-slate-300">{t.name}</label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-cyber-border bg-cyber-card pl-9 pr-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300">{t.email}</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-cyber-border bg-cyber-card pl-9 pr-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">{t.password}</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-cyber-border bg-cyber-card pl-9 pr-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyber-accent to-sky-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyber-accent/25 hover:from-sky-500 hover:to-cyber-accent transition-all"
          >
            {loading ? "..." : isLogin ? t.signIn : t.signUp}
          </button>
        </form>
      </div>
    </div>
  );
}
