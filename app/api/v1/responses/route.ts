import { NextRequest, NextResponse } from "next/server";
import { proxyChatCompletion } from "@/lib/gateway";
import { verifyBearerToken } from "@/lib/auth/keys";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Minimal Responses API compatibility: map OpenAI Responses shape into Chat
// Completions and proxy it through the same gateway pipeline.
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!verifyBearerToken(token)) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const input = raw.input;
  const messages: ChatMessage[] = Array.isArray(input)
    ? input.map((m: Record<string, unknown>) => {
        const rawRole = String(m.role ?? "user");
        const role: ChatMessage["role"] =
          rawRole === "developer" || rawRole === "system" ? "system" : rawRole === "assistant" ? "assistant" : "user";
        return { role, content: String(m.content ?? "") };
      })
    : [{ role: "user", content: String(input ?? "") }];

  const result = await proxyChatCompletion({
    model: String(raw.model ?? "auto"),
    messages,
    temperature: raw.temperature as number | undefined,
    max_tokens: raw.max_output_tokens as number | undefined,
    stream: raw.stream as boolean | undefined,
  });
  return new NextResponse(result.response.body, { status: result.response.status, headers: result.response.headers });
}
