import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasPermission } from "@/lib/auth";

// GET /api/v1/projects/[projectId]/tables
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const tables = await prisma.tableSchema.findMany({
      where: { projectId },
      include: {
        columns: true,
        _count: { select: { records: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, tables });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/v1/projects/[projectId]/tables (requires manage_schema permission)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { user } = await getCurrentUser(req);
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required to modify schema" },
          { status: 401 }
        );
      }
      if (!hasPermission(user, "manage_schema")) {
        return NextResponse.json(
          { success: false, error: "Access Denied: manage_schema permission required" },
          { status: 403 }
        );
      }
    }

    const { projectId } = await params;
    const body = await req.json();
    const { name, displayName, description, columns = [] } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Table name is required" },
        { status: 400 }
      );
    }

    const cleanTableName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const table = await prisma.tableSchema.create({
      data: {
        projectId,
        name: cleanTableName,
        displayName: displayName || name,
        description,
        columns: {
          create: columns.map((col: any) => ({
            name: col.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
            displayName: col.displayName || col.name,
            type: col.type || "string",
            isRequired: !!col.isRequired,
            defaultValue: col.defaultValue ? String(col.defaultValue) : null,
          })),
        },
      },
      include: { columns: true },
    });

    await prisma.auditLog.create({
      data: {
        projectId,
        action: "TABLE_CREATE",
        target: table.name,
        details: user ? `Created by ${user.email}` : undefined,
      },
    });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
