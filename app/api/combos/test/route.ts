import { NextRequest, NextResponse } from "next/server";
import { getCombo, resolveTargetForCombo } from "@/lib/combos";
import { getProvider } from "@/lib/providers/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const combo = getCombo(String(body.combo ?? "auto"));
  if (!combo) return NextResponse.json({ error: { message: "Combo not found" } }, { status: 404 });
  const target = resolveTargetForCombo(combo);
  if (!target) return NextResponse.json({ error: { message: "No available target" } }, { status: 400 });
  const provider = getProvider(target.providerId);
  return NextResponse.json({
    ok: true,
    decision: combo.strategy,
    target,
    provider: provider ? { id: provider.id, name: provider.name, status: provider.status } : null,
  });
}
