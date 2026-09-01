import { NextRequest, NextResponse } from "next/server";
import { getProvider, getProviderApiKey, setProviderStatus } from "@/lib/providers/service";
import { audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await ctx.params;
  const provider = getProvider(providerId);
  if (!provider) return NextResponse.json({ error: { message: "Provider not found" } }, { status: 404 });

  const base = (provider.apiBaseUrl ?? "").replace(/\/$/, "");
  const key = getProviderApiKey(provider);
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;

  const started = Date.now();
  try {
    const res = await fetch(`${base}/models`, { headers });
    const ok = res.ok;
    setProviderStatus(provider.id, ok ? "connected" : "error", ok ? undefined : `HTTP ${res.status}`);
    audit("dashboard", "provider.test", provider.id, undefined, { status: res.status, ms: Date.now() - started });
    return NextResponse.json({
      ok,
      status: res.status,
      latencyMs: Date.now() - started,
      body: ok ? await res.json().catch(() => ({})) : await res.text().catch(() => ""),
    });
  } catch (err) {
    setProviderStatus(provider.id, "error", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
