import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "./db";
import { Permission, User, UserRole } from "@/types";

// Role-based Default Permissions Matrix
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  SUPER_ADMIN: {
    manage_users: true,
    create_project: true,
    delete_project: true,
    manage_schema: true,
    write_records: true,
    delete_records: true,
    execute_sql: true,
    manage_alerts: true,
    view_monitoring: true,
  },
  ADMIN: {
    manage_users: true,
    create_project: true,
    delete_project: true,
    manage_schema: true,
    write_records: true,
    delete_records: true,
    execute_sql: true,
    manage_alerts: true,
    view_monitoring: true,
  },
  DEVELOPER: {
    manage_users: false,
    create_project: true,
    delete_project: false,
    manage_schema: true,
    write_records: true,
    delete_records: true,
    execute_sql: true,
    manage_alerts: false,
    view_monitoring: true,
  },
  VIEWER: {
    manage_users: false,
    create_project: false,
    delete_project: false,
    manage_schema: false,
    write_records: false,
    delete_records: false,
    execute_sql: false,
    manage_alerts: false,
    view_monitoring: true,
  },
};

// Password Hashing via Node.js crypto scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Generate Secure API Key
export function generateApiKey(): string {
  return `pos_${crypto.randomBytes(24).toString("hex")}`;
}

// Session Creation
export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
    include: {
      user: true,
    },
  });

  return session;
}

// Get User Permissions (combines role defaults + custom overrides)
export function getUserPermissions(user: {
  role: string;
  permissions?: string | Record<Permission, boolean> | null;
}): Record<Permission, boolean> {
  const role = (user.role as UserRole) || "VIEWER";
  const defaults = ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.VIEWER;

  if (!user.permissions) {
    return defaults;
  }

  if (typeof user.permissions === "object") {
    return { ...defaults, ...user.permissions };
  }

  try {
    const overrides = JSON.parse(user.permissions);
    return { ...defaults, ...overrides };
  } catch {
    return defaults;
  }
}

// Check Permission
export function hasPermission(
  user: { role: string; permissions?: string | Record<Permission, boolean> | null },
  permission: Permission
): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  const perms = getUserPermissions(user);
  return !!perms[permission];
}

// Get Current User from NextRequest (via Cookie, Authorization Bearer, or X-API-Key)
export async function getCurrentUser(req: NextRequest): Promise<{
  user: User | null;
  permissions: Record<Permission, boolean>;
}> {
  try {
    // 1. Check API Key header
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const user = await prisma.user.findUnique({
        where: { apiKey, isActive: true },
      });
      if (user) {
        return {
          user: user as unknown as User,
          permissions: getUserPermissions(user),
        };
      }
    }

    // 2. Check Authorization Bearer header
    let token: string | undefined;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    // 3. Check projectos_session cookie
    if (!token) {
      token = req.cookies.get("projectos_session")?.value;
    }

    if (!token) {
      return { user: null, permissions: ROLE_DEFAULT_PERMISSIONS.VIEWER };
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      return { user: null, permissions: ROLE_DEFAULT_PERMISSIONS.VIEWER };
    }

    return {
      user: session.user as unknown as User,
      permissions: getUserPermissions(session.user),
    };
  } catch {
    return { user: null, permissions: ROLE_DEFAULT_PERMISSIONS.VIEWER };
  }
}
