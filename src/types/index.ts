export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DEVELOPER" | "VIEWER";

export type Permission =
  | "manage_users"
  | "create_project"
  | "delete_project"
  | "manage_schema"
  | "write_records"
  | "delete_records"
  | "execute_sql"
  | "manage_alerts"
  | "view_monitoring";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  apiKey?: string | null;
  permissions?: Record<Permission, boolean> | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: string | Date;
  user?: User;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  dbType: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  tables?: TableSchema[];
}

export interface TableSchema {
  id: string;
  projectId: string;
  name: string;
  displayName?: string | null;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  columns: ColumnSchema[];
  records?: RecordRow[];
}

export interface ColumnSchema {
  id?: string;
  tableId?: string;
  name: string;
  displayName?: string | null;
  type: "string" | "number" | "boolean" | "datetime" | "json";
  isRequired: boolean;
  isUnique?: boolean;
  defaultValue?: string | null;
}

export interface RecordRow {
  id: string;
  tableId: string;
  data: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SystemVitals {
  cpuUsage: number;
  cpuModel: string;
  cpuCores: number;
  totalMemoryMb: number;
  usedMemoryMb: number;
  freeMemoryMb: number;
  memoryUsagePercent: number;
  uptimeSeconds: number;
  platform: string;
  arch: string;
  nodeVersion: string;
  timestamp: string;
}

export interface TelemetryStats {
  totalRequests: number;
  avgLatencyMs: number;
  requestsPerSecond: number;
  successRate: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
}

export interface AuditLogItem {
  id: string;
  projectId?: string | null;
  action: string;
  target: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string | Date;
}

export interface AlertSettings {
  telegramBotToken: string;
  telegramChatId: string;
  discordWebhook: string;
  isTelegramEnabled: boolean;
  isDiscordEnabled: boolean;
  cpuThreshold: number;
}
