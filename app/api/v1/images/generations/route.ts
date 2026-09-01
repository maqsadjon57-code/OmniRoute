import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/auth/keys";
import { listProviders, getProviderApiKey, getProvider } from "@/lib/providers/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const key = verifyBearerToken(token);
  if (!key) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const model = String(body.model ?? "auto");
  const parts = model.split("/");
  const provider = listProviders().find((p) => p.definitionId === parts[0] || p.id === parts[0]);
  if (!provider) {
    return NextResponse.json({ error: { message: "No image provider connected" } }, { status: 400 });
  }
  const p = getProvider(provider.id);
  const upstream = await fetch(`${(p?.apiBaseUrl ?? "").replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getProviderApiKey(p!)}`,
    },
    body: JSON.stringify({ ...body, model: parts.slice(1).join("/") || p?.models[0]?.id }),
  });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
