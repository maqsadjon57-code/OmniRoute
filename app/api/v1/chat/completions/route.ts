import { NextRequest, NextResponse } from "next/server";
import { proxyChatCompletion } from "@/lib/gateway";
import { verifyBearerToken, ipAllowed, recordApiKeyUsage } from "@/lib/auth/keys";
import { newId } from "@/lib/utils";
import type { ChatCompletionRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const apiKey = verifyBearerToken(token);
  const headers = new Headers();

  const cf = req.headers.get("x-forwarded-for") ?? "";
  const ip = cf.split(",")[0]?.trim() ?? "";
  if (!apiKey || !ipAllowed(apiKey, ip)) {
    return NextResponse.json(
      { error: { message: "Invalid or unauthorized API key", type: "authentication_error" } },
      { status: 401 },
    );
  }

  let body: ChatCompletionRequest;
  try {
    body = (await req.json()) as ChatCompletionRequest;
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON body" } }, { status: 400 });
  }

  const compressionOverride = req.headers.get("x-omniroute-compression");
  const compressionProfile = compressionOverride && compressionOverride !== "off" ? compressionOverride : undefined;

  try {
    const result = await proxyChatCompletion(body, {
      compressionOverride: compressionOverride === "off" ? false : undefined,
      compressionProfile,
    });
    result.response.headers.forEach((value, key) => headers.set(key, value));
    headers.set("X-Request-Id", newId("req"));
    if (apiKey.id) {
      recordApiKeyUsage(apiKey.id, result.requestTokens ?? 0);
    }
    return new NextResponse(result.response.body, { status: result.response.status, headers });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          message: err instanceof Error ? err.message : String(err),
          type: "gateway_error",
        },
      },
      { status: 502 },
    );
  }
}
