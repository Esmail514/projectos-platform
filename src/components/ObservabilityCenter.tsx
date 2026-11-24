"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { SystemVitals, TelemetryStats } from "@/types";
import { Cpu, HardDrive, Clock, Activity, Zap, ShieldAlert, CheckCircle2 } from "lucide-react";

interface Props {
  lang: Language;
}

export function ObservabilityCenter({ lang }: Props) {
  const t = translations[lang];
  const [vitals, setVitals] = useState<SystemVitals | null>(null);
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVitals = async () => {
    try {
      const res = await fetch("/api/v1/monitoring/vitals");
      const json = await res.json();
      if (json.success) {
        setVitals(json.vitals);
        setStats(json.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 3000); // 3s polling for real-time meters
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-cyber-border bg-gradient-to-r from-cyber-card to-cyber-dark p-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyber-glow" />
            <h1 className="text-xl font-black text-white">{t.observability}</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time telemetry, memory pressure, CPU load, and latency monitoring engine.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-cyber-dark px-3 py-1.5 border border-cyber-border text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Polling 3s</span>
        </div>
      </div>

      {/* Vitals KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.cpuUsage}</span>
            <Cpu className="h-4 w-4 text-cyber-glow" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{vitals?.cpuUsage ?? "--"}%</span>
            <span className="text-xs text-slate-400">{vitals?.cpuCores} Cores</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                (vitals?.cpuUsage || 0) > 80 ? "bg-rose-500" : "bg-cyber-accent"
              }`}
              style={{ width: `${vitals?.cpuUsage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* RAM Card */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.ramUsage}</span>
            <HardDrive className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{vitals?.memoryUsagePercent ?? "--"}%</span>
            <span className="text-xs text-slate-400">
              {vitals?.usedMemoryMb} / {vitals?.totalMemoryMb} MB
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${vitals?.memoryUsagePercent || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Latency Card */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.avgLatency}</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats?.avgLatencyMs ?? 0}</span>
            <span className="text-xs text-slate-400">ms / req</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Optimal latency</span>
          </div>
        </div>

        {/* Uptime Card */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.uptime}</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 text-lg font-bold text-white font-mono">
            {vitals ? formatUptime(vitals.uptimeSeconds) : "--"}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Node: {vitals?.nodeVersion} ({vitals?.platform})
          </div>
        </div>
      </div>

      {/* Traffic & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-cyber-border bg-cyber-card/60 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">HTTP Status Codes Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <span className="text-xs font-semibold text-emerald-400">2xx Success</span>
              <p className="mt-2 text-2xl font-black text-white">{stats?.status2xx || 0}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
              <span className="text-xs font-semibold text-amber-400">4xx Client Errors</span>
              <p className="mt-2 text-2xl font-black text-white">{stats?.status4xx || 0}</p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
              <span className="text-xs font-semibold text-rose-400">5xx Server Errors</span>
              <p className="mt-2 text-2xl font-black text-white">{stats?.status5xx || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card/60 p-6 space-y-3">
          <h3 className="text-sm font-bold text-white">Security & Health Integrity</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-cyber-border/50 text-slate-300">
              <span>SQL Injection Shield</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-cyber-border/50 text-slate-300">
              <span>Auto OpenAPI Reflection</span>
              <span className="font-semibold text-emerald-400">Synchronized</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Alert Notifications</span>
              <span className="font-semibold text-cyber-glow">Multi-Channel Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
