import { NextRequest, NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/auth/keys";
import { audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  revokeApiKey(id);
  audit("dashboard", "api_key.revoke", id);
  return NextResponse.json({ ok: true });
}
