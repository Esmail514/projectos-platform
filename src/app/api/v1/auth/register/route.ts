import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, generateApiKey, getUserPermissions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
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

    // Check if this is the first user ever registered; if so, promote to SUPER_ADMIN!
    const usersCount = await prisma.user.count();
    const role = usersCount === 0 ? "SUPER_ADMIN" : "DEVELOPER";

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: hashPassword(password),
        role,
        apiKey: generateApiKey(),
      },
    });

    const session = await createSession(user.id);
    const permissions = getUserPermissions(user);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          apiKey: user.apiKey,
          permissions,
        },
        token: session.token,
      },
      { status: 201 }
    );

    response.cookies.set("projectos_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
