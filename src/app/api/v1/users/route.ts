import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasPermission, hashPassword, generateApiKey, getUserPermissions } from "@/lib/auth";

// GET /api/v1/users - List all users
export async function GET(req: NextRequest) {
  try {
    const { user } = await getCurrentUser(req);
    if (!user || !hasPermission(user, "manage_users")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: manage_users permission required" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        apiKey: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedUsers = users.map((u) => ({
      ...u,
      permissions: getUserPermissions(u),
    }));

    return NextResponse.json({ success: true, users: parsedUsers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/v1/users - Create new user by Admin
export async function POST(req: NextRequest) {
  try {
    const { user: currentUser } = await getCurrentUser(req);
    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: manage_users permission required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name, password, role = "DEVELOPER", permissions, isActive = true } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: hashPassword(password),
        role,
        isActive: !!isActive,
        apiKey: generateApiKey(),
        permissions: permissions ? JSON.stringify(permissions) : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_CREATE",
        target: newUser.email,
        details: JSON.stringify({ role: newUser.role }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isActive: newUser.isActive,
        apiKey: newUser.apiKey,
        permissions: getUserPermissions(newUser),
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
