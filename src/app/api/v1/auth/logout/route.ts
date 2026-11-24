import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("projectos_session")?.value;

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("projectos_session");
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
