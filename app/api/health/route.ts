import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PROVIDERS_SIZE, FREE_PROVIDERS_SIZE } from "@/lib/providers/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const version = (db.prepare("SELECT MAX(version) AS v FROM _migrations").get() as { v: number }).v;
  return NextResponse.json({
    status: "ok",
    version: "0.1.0",
    dbMigrations: version,
    catalog: {
      providers: PROVIDERS_SIZE,
      freeTiers: FREE_PROVIDERS_SIZE,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
