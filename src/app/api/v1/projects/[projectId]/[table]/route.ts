import { NextRequest, NextResponse } from "next/server";
import { executeAutoAPI } from "@/lib/auto-api-engine";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasPermission } from "@/lib/auth";

// GET /api/v1/projects/[projectId]/[table] - Auto LIST
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; table: string }> }
) {
  try {
    const { projectId, table } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const data = await executeAutoAPI(projectId, table, "LIST", {
      queryOptions: { limit, offset },
    });

    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// POST /api/v1/projects/[projectId]/[table] - Auto CREATE (requires write_records permission)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; table: string }> }
) {
  try {
    const { user } = await getCurrentUser(req);
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required to write records" },
          { status: 401 }
        );
      }
      if (!hasPermission(user, "write_records")) {
        return NextResponse.json(
          { success: false, error: "Access Denied: write_records permission required" },
          { status: 403 }
        );
      }
    }

    const { projectId, table } = await params;
    const payload = await req.json();

    const data = await executeAutoAPI(projectId, table, "CREATE", { payload });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// DELETE /api/v1/projects/[projectId]/[table] - Auto DELETE (requires delete_records permission)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; table: string }> }
) {
  try {
    const { user } = await getCurrentUser(req);
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required to delete records" },
          { status: 401 }
        );
      }
      if (!hasPermission(user, "delete_records")) {
        return NextResponse.json(
          { success: false, error: "Access Denied: delete_records permission required" },
          { status: 403 }
        );
      }
    }

    const { projectId, table } = await params;
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: "Record ID (?id=...) is required for deletion" },
        { status: 400 }
      );
    }

    const data = await executeAutoAPI(projectId, table, "DELETE", { recordId });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
