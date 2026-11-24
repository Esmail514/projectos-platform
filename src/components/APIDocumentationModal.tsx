"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { X, BookOpen, Terminal, Copy, Check } from "lucide-react";

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export function APIDocumentationModal({ lang, isOpen, onClose }: Props) {
  const t = translations[lang];
  const [spec, setSpec] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/docs")
        .then((r) => r.json())
        .then((data) => setSpec(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const paths = spec?.paths || {};
  const pathKeys = Object.keys(paths);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyber-glow" />
            <div>
              <h2 className="text-lg font-bold text-white">{t.apiDocs}</h2>
              <p className="text-xs text-slate-400">OpenAPI 3.0 specification & auto-generated endpoints</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {pathKeys.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No tables defined yet. Create tables in your projects to dynamically generate REST endpoints!
          </div>
        ) : (
          <div className="space-y-4">
            {pathKeys.map((path) => {
              const methods = paths[path];
              return (
                <div key={path} className="rounded-xl border border-cyber-border bg-cyber-card/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">{path}</span>
                    <button
                      onClick={() => copySnippet(path, path)}
                      className="text-xs text-slate-400 hover:text-cyber-glow flex items-center gap-1"
                    >
                      {copiedKey === path ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {methods.get && (
                      <div className="flex items-center gap-2 rounded-lg bg-cyber-dark p-2 text-xs">
                        <span className="rounded bg-sky-500/20 px-2 py-0.5 font-bold text-sky-400">GET</span>
                        <span className="text-slate-300">{methods.get.summary}</span>
                      </div>
                    )}
                    {methods.post && (
                      <div className="flex items-center gap-2 rounded-lg bg-cyber-dark p-2 text-xs">
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400">POST</span>
                        <span className="text-slate-300">{methods.post.summary}</span>
                      </div>
                    )}
                    {methods.delete && (
                      <div className="flex items-center gap-2 rounded-lg bg-cyber-dark p-2 text-xs">
                        <span className="rounded bg-rose-500/20 px-2 py-0.5 font-bold text-rose-400">DELETE</span>
                        <span className="text-slate-300">{methods.delete.summary}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
