import { getDb } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import { getProviderDefinition, PROVIDERS } from "@/lib/providers/catalog";
import { newId } from "@/lib/utils";
import type { ProviderModel } from "@/lib/types";

export interface ConnectedProvider {
  id: string;
  definitionId: string;
  name: string;
  category: string;
  authType: string;
  status: "connected" | "disconnected" | "error" | "cooldown";
  encryptedKey?: string;
  apiBaseUrl?: string;
  models: ProviderModel[];
  freeTier: boolean;
  rating: number;
  lastHealth: string | null;
  lastError: string | null;
  requestsTotal: number;
  tokensTotal: number;
  createdAt: string;
  updatedAt: string;
}

function rowToProvider(row: Record<string, unknown>): ConnectedProvider {
  return {
    id: String(row.id),
    definitionId: String(row.definition_id),
    name: String(row.name),
    category: String(row.category),
    authType: String(row.auth_type),
    status: String(row.status) as ConnectedProvider["status"],
    encryptedKey: row.encrypted_key ? String(row.encrypted_key) : undefined,
    apiBaseUrl: row.api_base_url ? String(row.api_base_url) : undefined,
    models: JSON.parse(String(row.models_json ?? "[]")) as ProviderModel[],
    freeTier: Boolean(row.free_tier),
    rating: Number(row.rating ?? 0),
    lastHealth: row.last_health ? String(row.last_health) : null,
    lastError: row.last_error ? String(row.last_error) : null,
    requestsTotal: Number(row.requests_total ?? 0),
    tokensTotal: Number(row.tokens_total ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function listProviders(): ConnectedProvider[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM providers ORDER BY free_tier DESC, rating DESC").all();
  return (rows as Record<string, unknown>[]).map(rowToProvider);
}

export function listProviderDefinitions() {
  return PROVIDERS;
}

export function getProvider(idOrDefId: string): ConnectedProvider | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM providers WHERE id = ? OR definition_id = ? ORDER BY id DESC")
    .get(idOrDefId, idOrDefId) as Record<string, unknown> | undefined;
  return row ? rowToProvider(row) : null;
}

export function connectProvider(opts: {
  definitionId: string;
  apiKey?: string;
  apiBaseUrl?: string;
  extra?: Record<string, unknown>;
}): ConnectedProvider {
  const definition = getProviderDefinition(opts.definitionId);
  if (!definition) throw new Error(`Unknown provider definition: ${opts.definitionId}`);
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM providers WHERE definition_id = ?")
    .get(opts.definitionId) as { id: string } | undefined;
  const id = existing?.id ?? newId("prov");
  const encryptedKey = opts.apiKey ? encrypt(opts.apiKey) : null;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO providers(id, definition_id, name, category, auth_type, status, encrypted_key, api_base_url, models_json, free_tier, rating, updated_at)
     VALUES (?, ?, ?, ?, ?, 'connected', ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       category = excluded.category,
       auth_type = excluded.auth_type,
       status = 'connected',
       encrypted_key = COALESCE(excluded.encrypted_key, providers.encrypted_key),
       api_base_url = COALESCE(excluded.api_base_url, providers.api_base_url),
       models_json = excluded.models_json,
       free_tier = excluded.free_tier,
       rating = excluded.rating,
       updated_at = excluded.updated_at`,
  ).run(
    id,
    definition.id,
    definition.name,
    definition.category,
    definition.authType,
    encryptedKey,
    opts.apiBaseUrl ?? definition.apiBaseUrl,
    JSON.stringify(definition.models),
    definition.freeTier ? 1 : 0,
    definition.rating ?? 0,
    now,
  );
  return getProvider(id)!;
}

export function disconnectProvider(id: string) {
  getDb().prepare("DELETE FROM providers WHERE id = ?").run(id);
}

export function setProviderStatus(id: string, status: ConnectedProvider["status"], error?: string) {
  getDb()
    .prepare("UPDATE providers SET status = ?, last_error = ?, updated_at = ? WHERE id = ?")
    .run(status, error ?? null, new Date().toISOString(), id);
}

export function getProviderApiKey(provider: ConnectedProvider): string {
  if (!provider.encryptedKey) return "";
  return decrypt(provider.encryptedKey);
}
