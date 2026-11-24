"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { AlertSettings } from "@/types";
import { X, Send, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export function AlertSettingsModal({ lang, isOpen, onClose }: Props) {
  const t = translations[lang];
  const [settings, setSettings] = useState<AlertSettings>({
    telegramBotToken: "",
    telegramChatId: "",
    discordWebhook: "",
    isTelegramEnabled: false,
    isDiscordEnabled: false,
    cpuThreshold: 85,
  });
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/monitoring/alerts")
        .then((r) => r.json())
        .then((data) => {
          if (data.config) {
            setSettings({
              telegramBotToken: data.config.telegramBotToken || "",
              telegramChatId: data.config.telegramChatId || "",
              discordWebhook: data.config.discordWebhook || "",
              isTelegramEnabled: data.config.isTelegramEnabled || false,
              isDiscordEnabled: data.config.isDiscordEnabled || false,
              cpuThreshold: data.config.cpuThreshold || 85,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const res = await fetch("/api/v1/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setStatusMsg({ text: t.saveSettings + " - OK!", ok: true });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch {
      setStatusMsg({ text: "Error saving settings", ok: false });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/v1/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, action: "TEST_ALERT" }),
      });
      const data = await res.json();
      if (data.telegram || data.discord) {
        setStatusMsg({ text: t.alertSentSuccess, ok: true });
      } else {
        setStatusMsg({ text: t.alertSentFailed, ok: false });
      }
    } catch {
      setStatusMsg({ text: t.alertSentFailed, ok: false });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyber-glow" />
            <h3 className="text-lg font-bold text-white">{t.settings}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telegram Config */}
        <div className="space-y-3 rounded-xl border border-cyber-border bg-cyber-card/50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{t.telegramAlerts}</span>
            <input
              type="checkbox"
              checked={settings.isTelegramEnabled}
              onChange={(e) => setSettings({ ...settings, isTelegramEnabled: e.target.checked })}
              className="h-4 w-4 rounded accent-cyber-accent"
            />
          </div>
          <input
            type="text"
            placeholder={t.botToken}
            value={settings.telegramBotToken}
            onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
            className="w-full rounded-lg border border-cyber-border bg-cyber-dark px-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder={t.chatId}
            value={settings.telegramChatId}
            onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
            className="w-full rounded-lg border border-cyber-border bg-cyber-dark px-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
          />
        </div>

        {/* Discord Config */}
        <div className="space-y-3 rounded-xl border border-cyber-border bg-cyber-card/50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{t.discordAlerts}</span>
            <input
              type="checkbox"
              checked={settings.isDiscordEnabled}
              onChange={(e) => setSettings({ ...settings, isDiscordEnabled: e.target.checked })}
              className="h-4 w-4 rounded accent-cyber-accent"
            />
          </div>
          <input
            type="text"
            placeholder={t.webhookURL}
            value={settings.discordWebhook}
            onChange={(e) => setSettings({ ...settings, discordWebhook: e.target.value })}
            className="w-full rounded-lg border border-cyber-border bg-cyber-dark px-3 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
          />
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              statusMsg.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}
          >
            {statusMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{testing ? "Sending..." : t.testAlert}</span>
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-cyber-accent px-5 py-2 text-xs font-bold text-white hover:bg-sky-500"
          >
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
}
