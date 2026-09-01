import { NextResponse } from "next/server";
import { listProviders } from "@/lib/providers/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const providers = listProviders().map((p) => ({
    id: p.id,
    definitionId: p.definitionId,
    name: p.name,
    category: p.category,
    authType: p.authType,
    status: p.status,
    models: p.models,
    freeTier: p.freeTier,
    rating: p.rating,
    lastHealth: p.lastHealth,
    lastError: p.lastError,
    requestsTotal: p.requestsTotal,
    tokensTotal: p.tokensTotal,
  }));
  return NextResponse.json(providers);
}
