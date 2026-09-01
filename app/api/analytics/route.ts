import { NextResponse } from "next/server";
import { summary, providerBreakdown, byDay, recentRequests } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    summary: summary(),
    providers: providerBreakdown(),
    byDay: byDay(30),
    recent: recentRequests(20),
  });
}
