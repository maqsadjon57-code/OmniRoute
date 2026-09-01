import { NextRequest, NextResponse } from "next/server";
import { connectProvider } from "@/lib/providers/service";
import { audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  try {
    const provider = connectProvider({
      definitionId: String(body.definitionId ?? providerId),
      apiKey: body.apiKey ? String(body.apiKey) : undefined,
      apiBaseUrl: body.apiBaseUrl ? String(body.apiBaseUrl) : undefined,
    });
    audit("dashboard", "provider.connect", provider.id);
    return NextResponse.json(provider, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
