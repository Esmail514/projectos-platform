import { NextRequest, NextResponse } from "next/server";
import { executeDirectSQL } from "@/lib/direct-sql-engine";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasPermission } from "@/lib/auth";

// POST /api/v1/projects/[projectId]/sql - Direct High-Speed SQL Execution (requires execute_sql permission)
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
          { success: false, error: "Authentication required to execute raw SQL" },
          { status: 401 }
        );
      }
      if (!hasPermission(user, "execute_sql")) {
        return NextResponse.json(
          { success: false, error: "Access Denied: execute_sql permission required" },
          { status: 403 }
        );
      }
    }

    const { projectId } = await params;
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: "SQL query is required" }, { status: 400 });
    }

    const result = await executeDirectSQL(projectId, query);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
