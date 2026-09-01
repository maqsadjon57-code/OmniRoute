import { NextRequest, NextResponse } from "next/server";
import { disconnectProvider } from "@/lib/providers/service";
import { audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await ctx.params;
  disconnectProvider(providerId);
  audit("dashboard", "provider.disconnect", providerId);
  return NextResponse.json({ ok: true });
}
