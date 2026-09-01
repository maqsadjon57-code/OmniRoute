import { NextRequest, NextResponse } from "next/server";
import { newId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
}
const store = new Map<string, Webhook>();

export async function GET() {
  return NextResponse.json([...store.values()]);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = String(body.url ?? "");
  if (!/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: { message: "url must be http(s)" } }, { status: 400 });
  }
  const id = newId("wh");
  const record: Webhook = { id, url, events: Array.isArray(body.events) ? body.events : ["request.completed"], createdAt: new Date().toISOString() };
  store.set(id, record);
  return NextResponse.json(record, { status: 201 });
}
