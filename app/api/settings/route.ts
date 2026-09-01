import { NextRequest, NextResponse } from "next/server";
import { getDb, getSetting, setSetting, audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings ORDER BY key").all() as {
    key: string;
    value: string;
  }[];
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    setSetting(key, String(value));
  }
  audit("dashboard", "settings.update", "global", undefined, { keys: Object.keys(body) });
  const theme = body["app.theme"];
  const language = body["app.language"];
  return NextResponse.json({
    ok: true,
    theme: theme ?? getSetting("app.theme", "dark"),
    language: language ?? getSetting("app.language", "en"),
  });
}
