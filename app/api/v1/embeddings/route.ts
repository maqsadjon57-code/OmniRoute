import { NextRequest, NextResponse } from "next/server";
import { proxyEmbedding } from "@/lib/gateway";
import { verifyBearerToken } from "@/lib/auth/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!verifyBearerToken(token)) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const upstream = await proxyEmbedding(body);
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
