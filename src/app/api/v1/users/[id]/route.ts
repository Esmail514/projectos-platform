import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasPermission, hashPassword, generateApiKey, getUserPermissions } from "@/lib/auth";

// PATCH /api/v1/users/[id] - Update user, role, permissions, status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentUser } = await getCurrentUser(req);
    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: manage_users permission required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, role, permissions, isActive, password, resetApiKey } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Safety: only SUPER_ADMIN can demote or change another SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only Super Admins can modify Super Admin accounts" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (password) updateData.passwordHash = hashPassword(password);
    if (resetApiKey) updateData.apiKey = generateApiKey();

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATE",
        target: updated.email,
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        isActive: updated.isActive,
        apiKey: updated.apiKey,
        permissions: getUserPermissions(updated),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/v1/users/[id] - Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentUser } = await getCurrentUser(req);
    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: manage_users permission required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Safety: prevent deleting the last Super Admin
    if (targetUser.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the sole Super Admin of the platform" },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "USER_DELETE",
        target: targetUser.email,
      },
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
