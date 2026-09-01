import { getDb } from "@/lib/db";
import { hashKey } from "@/lib/crypto";
import { newId, randomToken } from "@/lib/utils";

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  ipAllowlist: string[];
  rateLimit: number;
  usageTokens: number;
  requestsTotal: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function createApiKey(opts: {
  name: string;
  scopes?: string[];
  ipAllowlist?: string[];
  rateLimit?: number;
  expiresInDays?: number;
}): { record: ApiKeyRecord; key: string } {
  const db = getDb();
  const id = newId("key");
  const apiKey = `or_${randomToken(24)}`;
  const prefix = apiKey.slice(0, 10);
  const scopes = opts.scopes ?? ["read", "write"];
  const expiresAt = opts.expiresInDays
    ? new Date(Date.now() + opts.expiresInDays * 86_400_000).toISOString()
    : null;
  db.prepare(
    `INSERT INTO api_keys(id, name, prefix, hash, scopes_json, ip_allowlist_json, rate_limit, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    opts.name,
    prefix,
    hashKey(apiKey),
    JSON.stringify(scopes),
    JSON.stringify(opts.ipAllowlist ?? []),
    opts.rateLimit ?? 60,
    expiresAt,
  );
  return {
    record: getApiKeyByPrefix(prefix)!,
    key: apiKey,
  };
}

export function getApiKeyByPrefix(prefix: string): ApiKeyRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM api_keys WHERE prefix = ?").get(prefix) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToApiKey(row) : null;
}

export function verifyBearerToken(token: string): ApiKeyRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM api_keys WHERE hash = ?")
    .get(hashKey(token)) as Record<string, unknown> | undefined;
  if (!row) return null;
  const rec = rowToApiKey(row);
  if (rec.expiresAt && new Date(rec.expiresAt).getTime() < Date.now()) return null;
  db.prepare(
    "UPDATE api_keys SET last_used_at = ?, requests_total = requests_total + 1 WHERE id = ?",
  ).run(new Date().toISOString(), rec.id);
  return rec;
}

export function listApiKeys(): ApiKeyRecord[] {
  const db = getDb();
  return (db.prepare("SELECT * FROM api_keys ORDER BY created_at DESC").all() as Record<string, unknown>[]).map(
    rowToApiKey,
  );
}

export function revokeApiKey(id: string) {
  getDb().prepare("DELETE FROM api_keys WHERE id = ?").run(id);
}

export function recordApiKeyUsage(id: string, originalTokens: number): void {
  if (!id) return;
  getDb()
    .prepare("UPDATE api_keys SET usage_tokens = usage_tokens + ? WHERE id = ?")
    .run(isFinite(originalTokens) ? Math.max(0, originalTokens) : 0, id);
}

export function scopesAllowed(record: ApiKeyRecord | null, scope: "read" | "write" | "admin"): boolean {
  if (!record) return false;
  if (scope === "admin") return record.scopes.includes("admin");
  if (scope === "write") return record.scopes.includes("write") || record.scopes.includes("admin");
  return record.scopes.includes("read") || record.scopes.includes("write") || record.scopes.includes("admin");
}

export function ipAllowed(record: ApiKeyRecord, ip: string): boolean {
  if (!record.ipAllowlist.length) return true;
  return record.ipAllowlist.includes(ip);
}

function rowToApiKey(row: Record<string, unknown>): ApiKeyRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    prefix: String(row.prefix),
    scopes: JSON.parse(String(row.scopes_json ?? "[]")) as string[],
    ipAllowlist: JSON.parse(String(row.ip_allowlist_json ?? "[]")) as string[],
    rateLimit: Number(row.rate_limit ?? 60),
    usageTokens: Number(row.usage_tokens ?? 0),
    requestsTotal: Number(row.requests_total ?? 0),
    lastUsedAt: row.last_used_at ? String(row.last_used_at) : null,
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    createdAt: String(row.created_at),
  };
}

// shared shape for gateway context (future admin/scope expansion)
export type GatewayAuthContext = { key: ApiKeyRecord | null; scope: "read" | "write" | "admin" };
