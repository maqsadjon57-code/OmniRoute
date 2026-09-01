import { NextRequest, NextResponse } from "next/server";
import { getCombo, updateCombo, deleteCombo } from "@/lib/combos";
import { audit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const combo = getCombo(id);
  if (!combo) return NextResponse.json({ error: { message: "Combo not found" } }, { status: 404 });
  return NextResponse.json(combo);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  try {
    const combo = updateCombo(id, {
      name: body.name,
      strategy: body.strategy,
      targets: body.targets,
      active: body.active,
    });
    audit("dashboard", "combo.update", id);
    return NextResponse.json(combo);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  deleteCombo(id);
  audit("dashboard", "combo.delete", id);
  return NextResponse.json({ ok: true });
}
