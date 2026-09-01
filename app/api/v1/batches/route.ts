import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/auth/keys";
import { newId, safeJsonParse } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Batch {
  id: string;
  input_file_id: string;
  endpoint: string;
  status: "validating" | "in_progress" | "completed" | "failed";
  created_at: string;
  completed_at: string | null;
  request_counts: { total: number; completed: number; failed: number };
}

const batches = new Map<string, Batch>();

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!verifyBearerToken(token)) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = newId("batch");
  const batch: Batch = {
    id,
    input_file_id: String(body.input_file_id ?? ""),
    endpoint: String(body.endpoint ?? "/v1/chat/completions"),
    status: body.validate_only ? "completed" : "in_progress",
    created_at: new Date().toISOString(),
    completed_at: body.validate_only ? new Date().toISOString() : null,
    request_counts: { total: 1, completed: 0, failed: 0 },
  };
  batches.set(id, batch);
  return NextResponse.json({ object: "batch", ...batch }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ object: "list", data: [...batches.values()] });
}

export function __internal(s: string): unknown {
  return safeJsonParse<unknown>(s, null);
}
