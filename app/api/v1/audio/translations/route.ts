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
  const provider = listProviders().find((x) => x.category === "audio");
  const p = getProvider(provider?.id ?? "");
  if (!p) return NextResponse.json({ error: { message: "No audio provider connected" } }, { status: 400 });
  const upstream = await fetch(`${(p.apiBaseUrl ?? "").replace(/\/$/, "")}/audio/translations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getProviderApiKey(p)}` },
    body: req.body,
    // @ts-expect-error duplex is a Node fetch requirement for streams
    duplex: "half",
  });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
