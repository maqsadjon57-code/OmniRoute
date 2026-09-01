import { NextRequest, NextResponse } from "next/server";
import { proxyModelsList } from "@/lib/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ model: string }> }) {
  const { model } = await ctx.params;
  const list = await proxyModelsList();
  const found = list.data.find((m: { id: string }) => m.id.toLowerCase() === model.toLowerCase());
  if (!found) return NextResponse.json({ error: { message: "Model not found" } }, { status: 404 });
  return NextResponse.json(found);
}
