import { NextRequest, NextResponse } from "next/server";
import { listCombos, createCombo, createPresetCombosIfMissing } from "@/lib/combos";
import { audit } from "@/lib/db";
import { ROUTING_STRATEGIES } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  createPresetCombosIfMissing();
  return NextResponse.json(listCombos());
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const strategy = String(body.strategy ?? "auto");
  if (!ROUTING_STRATEGIES.includes(strategy as (typeof ROUTING_STRATEGIES)[number])) {
    return NextResponse.json({ error: { message: `Unknown strategy: ${strategy}` } }, { status: 400 });
  }
  const combo = createCombo({
    name: String(body.name ?? "New combo"),
    strategy: strategy as (typeof ROUTING_STRATEGIES)[number],
    targets: Array.isArray(body.targets) ? body.targets : [],
    active: body.active !== false,
  });
  audit("dashboard", "combo.create", combo.id);
  return NextResponse.json(combo, { status: 201 });
}
