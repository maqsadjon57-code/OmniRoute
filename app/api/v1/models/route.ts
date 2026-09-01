import { NextRequest, NextResponse } from "next/server";
import { proxyModelsList } from "@/lib/gateway";
import { verifyBearerToken } from "@/lib/auth/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const apiKey = verifyBearerToken(token);
  if (!apiKey) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const result = await proxyModelsList();
  return NextResponse.json(result);
}
