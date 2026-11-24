"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { User, UserRole, Permission } from "@/types";
import { Users, UserPlus, Shield, ShieldCheck, Key, Check, Copy, Trash2, Edit, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  lang: Language;
  currentUser: User | null;
}

const ALL_PERMISSIONS: { key: Permission; labelAr: string; labelEn: string }[] = [
  { key: "manage_users", labelAr: "إدارة المستخدمين والصلاحيات", labelEn: "Manage Users & Permissions" },
  { key: "create_project", labelAr: "إنشاء المشاريع", labelEn: "Create Projects" },
  { key: "delete_project", labelAr: "حذف المشاريع", labelEn: "Delete Projects" },
  { key: "manage_schema", labelAr: "تعديل الجداول وتصميم المخططات", labelEn: "Manage Tables & Schemas" },
  { key: "write_records", labelAr: "إضافة وتعديل السجلات", labelEn: "Insert & Update Records" },
  { key: "delete_records", labelAr: "حذف السجلات", labelEn: "Delete Records" },
  { key: "execute_sql", labelAr: "تنفيذ استعلامات SQL حرة", labelEn: "Execute Raw SQL Queries" },
  { key: "manage_alerts", labelAr: "إدارة إعدادات التنبيهات", labelEn: "Manage Alert Channels" },
  { key: "view_monitoring", labelAr: "عرض شاشات المراقبة والسجلات", labelEn: "View Observability & Logs" },
];

export function UserManagementView({ lang, currentUser }: Props) {
  const t = translations[lang];
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // New User Form State
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("DEVELOPER");
  const [customPerms, setCustomPerms] = useState<Record<Permission, boolean>>({
    manage_users: false,
    create_project: true,
    delete_project: false,
    manage_schema: true,
    write_records: true,
    delete_records: true,
    execute_sql: true,
    manage_alerts: false,
    view_monitoring: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users");
      const json = await res.json();
      if (json.success && json.users) {
        setUsers(json.users);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          name: newName,
          password: newPassword,
          role: newRole,
          permissions: customPerms,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        fetchUsers();
        setStatusMsg({ text: t.userCreatedSuccess, ok: true });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ text: data.error || "Failed to create user", ok: false });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message, ok: false });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/v1/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingUser.name,
          role: editingUser.role,
          isActive: editingUser.isActive,
          permissions: editingUser.permissions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingUser(null);
        fetchUsers();
        setStatusMsg({ text: t.userUpdatedSuccess, ok: true });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ text: data.error || "Failed to update user", ok: false });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message, ok: false });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert(t.cannotDeleteSelf);
      return;
    }
    if (!confirm(`Are you sure you want to delete ${user.name} (${user.email})?`)) return;

    try {
      const res = await fetch(`/api/v1/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      }
    } catch {}
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "DEVELOPER":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "VIEWER":
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-cyber-border bg-gradient-to-r from-cyber-card via-cyber-dark to-cyber-card p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-cyber-glow shadow-lg shadow-purple-600/30">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{t.usersControl}</h1>
            <p className="text-xs text-slate-400">
              Role-Based Access Control (RBAC) & Granular Multi-Tier Permissions System
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyber-accent px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-sky-500 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>{t.addUser}</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
            statusMsg.ok
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
          }`}
        >
          {statusMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-cyber-border bg-cyber-dark/80 shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cyber-border bg-cyber-card/80 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">{t.name}</th>
              <th className="px-4 py-3 font-semibold">{t.email}</th>
              <th className="px-4 py-3 font-semibold">{t.role}</th>
              <th className="px-4 py-3 font-semibold">{t.status}</th>
              <th className="px-4 py-3 font-semibold">{t.apiKey}</th>
              <th className="px-4 py-3 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40 text-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-cyber-card/30 transition-colors">
                <td className="px-4 py-3 font-bold text-white">{u.name}</td>
                <td className="px-4 py-3 font-mono text-slate-300">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getRoleBadge(
                      u.role
                    )}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      u.isActive ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-slate-500"}`}
                    ></span>
                    {u.isActive ? t.active : t.inactive}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.apiKey ? (
                    <button
                      onClick={() => copyApiKey(u.apiKey!)}
                      className="flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-cyber-glow"
                    >
                      <Key className="h-3 w-3 text-amber-400" />
                      <span>{u.apiKey.substring(0, 10)}...</span>
                      {copiedKey === u.apiKey ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyber-glow hover:bg-cyber-card"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl space-y-5">
            <h2 className="text-lg font-bold text-white">{t.addUser}</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">{t.name}</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t.email}</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t.password}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t.role}</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                >
                  <option value="SUPER_ADMIN">{t.superAdmin}</option>
                  <option value="ADMIN">{t.admin}</option>
                  <option value="DEVELOPER">{t.developer}</option>
                  <option value="VIEWER">{t.viewer}</option>
                </select>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="space-y-2 border-t border-cyber-border pt-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.permissions}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ALL_PERMISSIONS.map((p) => (
                    <label
                      key={p.key}
                      className="flex items-center gap-2 rounded-lg border border-cyber-border/40 bg-cyber-card/40 p-2 cursor-pointer hover:bg-cyber-card"
                    >
                      <input
                        type="checkbox"
                        checked={customPerms[p.key]}
                        onChange={(e) =>
                          setCustomPerms({ ...customPerms, [p.key]: e.target.checked })
                        }
                        className="rounded accent-cyber-accent"
                      />
                      <span className="text-slate-300">{lang === "ar" ? p.labelAr : p.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-cyber-border bg-cyber-dark p-6 shadow-2xl space-y-5">
            <h2 className="text-lg font-bold text-white">{t.editUser}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">{t.name}</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t.role}</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                  }
                  className="mt-1 w-full rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none"
                >
                  <option value="SUPER_ADMIN">{t.superAdmin}</option>
                  <option value="ADMIN">{t.admin}</option>
                  <option value="DEVELOPER">{t.developer}</option>
                  <option value="VIEWER">{t.viewer}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userActiveToggle"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="rounded accent-cyber-accent"
                />
                <label htmlFor="userActiveToggle" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  {editingUser.isActive ? t.active : t.inactive}
                </label>
              </div>

              {/* Edit Permissions */}
              <div className="space-y-2 border-t border-cyber-border pt-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.permissions}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = editingUser.permissions?.[p.key] ?? false;
                    return (
                      <label
                        key={p.key}
                        className="flex items-center gap-2 rounded-lg border border-cyber-border/40 bg-cyber-card/40 p-2 cursor-pointer hover:bg-cyber-card"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              permissions: {
                                ...(editingUser.permissions || ({} as any)),
                                [p.key]: e.target.checked,
                              },
                            })
                          }
                          className="rounded accent-cyber-accent"
                        />
                        <span className="text-slate-300">{lang === "ar" ? p.labelAr : p.labelEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyber-accent px-5 py-2 text-xs font-bold text-white hover:bg-sky-500 shadow-lg shadow-cyber-accent/30"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
