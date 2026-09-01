import { NextRequest, NextResponse } from "next/server";
import { listApiKeys, createApiKey } from "@/lib/auth/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keys = listApiKeys().map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    scopes: k.scopes,
    ipAllowlist: k.ipAllowlist,
    rateLimit: k.rateLimit,
    usageTokens: k.usageTokens,
    requestsTotal: k.requestsTotal,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
  }));
  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const created = createApiKey({
    name: String(body.name ?? "New key"),
    scopes: Array.isArray(body.scopes) ? body.scopes : ["read", "write"],
    ipAllowlist: Array.isArray(body.ipAllowlist) ? body.ipAllowlist : [],
    rateLimit: Number(body.rateLimit ?? 60),
    expiresInDays: body.expiresInDays ? Number(body.expiresInDays) : undefined,
  });
  // The full key is returned exactly once.
  return NextResponse.json({ ...created.record, key: created.key }, { status: 201 });
}
