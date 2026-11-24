"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { AuditLogItem } from "@/types";
import { Terminal, RefreshCw, Filter, Search } from "lucide-react";

interface Props {
  lang: Language;
}

export function LiveLogsViewer({ lang }: Props) {
  const t = translations[lang];
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/monitoring/logs");
      const json = await res.json();
      if (json.success && json.logs) {
        setLogs(json.logs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) =>
    `${log.action} ${log.target} ${log.details || ""}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cyber-border bg-cyber-card p-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyber-glow" />
          <h2 className="text-base font-bold text-white">{t.liveLogs}</h2>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t.search}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-cyber-border bg-cyber-dark pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyber-accent focus:outline-none"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg border border-cyber-border bg-cyber-dark text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-darker p-4 font-mono text-xs shadow-2xl max-h-[600px] overflow-y-auto space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-600">
            No live logs recorded yet. Create projects or invoke APIs to see live stream.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const time = new Date(log.createdAt).toLocaleTimeString();
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-900/60 transition-colors border-b border-slate-900"
              >
                <span className="text-slate-500 font-mono text-[11px] shrink-0">{time}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                    log.action.includes("CREATE")
                      ? "bg-emerald-500/20 text-emerald-400"
                      : log.action.includes("DELETE")
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-cyber-accent/20 text-cyber-glow"
                  }`}
                >
                  {log.action}
                </span>
                <span className="text-slate-300 shrink-0 font-semibold">{log.target}</span>
                {log.details && (
                  <span className="text-slate-500 truncate text-[11px]">{log.details}</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
