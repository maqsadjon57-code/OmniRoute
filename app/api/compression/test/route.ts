import { NextRequest, NextResponse } from "next/server";
import { getProfile, compressMessages, COMPRESSION_PROFILES } from "@/lib/compression";
import { estimateTokens } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "");
  const profile = getProfile(String(body.profile ?? "standard"));
  const result = compressMessages([{ role: "user", content: text }], profile.id);
  return NextResponse.json({
    original: text,
    compressed: textOf(result.messages),
    profile: result.profileId,
    originalTokens: result.originalTokens,
    compressedTokens: result.compressedTokens,
    savedTokens: result.savedTokens,
    savedPercent: result.savedPercent,
    engines: result.engines.map((e) => ({
      engine: e.engine,
      before: e.before,
      after: e.after,
    })),
  });
}

export async function GET() {
  return NextResponse.json({ profiles: COMPRESSION_PROFILES });
}

function textOf(messages: { content: unknown }[]): string {
  const first = messages[0];
  return typeof first?.content === "string" ? first.content : JSON.stringify(first?.content ?? "");
}

export function tokens(s: string) {
  return estimateTokens(s);
}
