import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, permissions } = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        user: null,
        permissions,
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        apiKey: user.apiKey,
        permissions,
      },
      permissions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
