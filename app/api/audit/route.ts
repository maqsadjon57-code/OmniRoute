import { NextRequest, NextResponse } from "next/server";
import { getDb, audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const db = getDb();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 1000);
  const rows = db
    .prepare("SELECT * FROM audit ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  audit(String(body.actor ?? "anonymous"), String(body.action ?? "unknown"), String(body.resource ?? ""));
  return NextResponse.json({ ok: true });
}
