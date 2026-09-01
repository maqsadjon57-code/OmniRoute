import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/auth/keys";
import { listProviders, getProvider, getProviderApiKey } from "@/lib/providers/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!verifyBearerToken(token)) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const provider = listProviders().find((x) => x.definitionId === "mistral-ocr");
  const p = getProvider(provider?.id ?? "");
  if (!p) return NextResponse.json({ error: { message: "Connect Mistral OCR first" } }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const upstream = await fetch(`${(p.apiBaseUrl ?? "").replace(/\/$/, "")}/ocr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getProviderApiKey(p)}`,
    },
    body: JSON.stringify(body),
  });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
