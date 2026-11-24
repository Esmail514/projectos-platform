import { NextResponse } from "next/server";
import { getSystemVitals, getTelemetryStats } from "@/lib/monitoring-service";

export async function GET() {
  try {
    const vitals = getSystemVitals();
    const stats = await getTelemetryStats();

    return NextResponse.json({
      success: true,
      vitals,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
