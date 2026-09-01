import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/auth/keys";
import { newId, toMb } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StoredFile {
  id: string;
  filename: string;
  bytes: number;
  purpose: string;
  createdAt: string;
}

// In-memory file registry for the self-hosted MVP. Persist to SQLite/S3 in cloud mode.
const files = new Map<string, StoredFile>();

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!verifyBearerToken(token)) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { message: "Missing file field" } }, { status: 400 });
  }
  const id = newId("file");
  const record: StoredFile = {
    id,
    filename: file.name,
    bytes: file.size,
    purpose: String(form.get("purpose") ?? "assistants"),
    createdAt: new Date().toISOString(),
  };
  files.set(id, record);
  return NextResponse.json({
    id,
    object: "file",
    bytes: record.bytes,
    filename: record.filename,
    purpose: record.purpose,
    size: toMb(record.bytes),
    created_at: record.createdAt,
  });
}

export async function GET() {
  return NextResponse.json({ object: "list", data: [...files.values()] });
}
