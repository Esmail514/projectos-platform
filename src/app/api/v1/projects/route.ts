import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasPermission } from "@/lib/auth";

// GET /api/v1/projects - List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tables: {
          include: {
            columns: true,
            _count: { select: { records: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/v1/projects - Create a new project (requires create_project permission)
export async function POST(req: NextRequest) {
  try {
    const { user } = await getCurrentUser(req);
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required to create projects" },
          { status: 401 }
        );
      }
      if (!hasPermission(user, "create_project")) {
        return NextResponse.json(
          { success: false, error: "Access Denied: create_project permission required" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { name, slug, description, dbType = "postgresql" } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        description,
        dbType,
      },
    });

    // Create an audit log
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        action: "PROJECT_CREATE",
        target: project.name,
        details: user ? `Created by ${user.email} (${user.role})` : "Created anonymously",
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
