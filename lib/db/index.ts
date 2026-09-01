import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { newId } from "@/lib/utils";

// Kept as a module-level singleton so all server imports share one connection.
let db: Database.Database | null = null;

function defaultDataDir(): string {
  const env = process.env.OMNIROUTE_DATA_DIR;
  return env || path.join(process.cwd(), "data");
}

export function getDb(): Database.Database {
  if (db) return db;
  const dir = defaultDataDir();
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "omniroute.db");
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  seed(db);
  return db;
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const current = (
    database.prepare("SELECT COALESCE(MAX(version), 0) AS v FROM _migrations").get() as { v: number }
  ).v;
  const migrations: { version: number; sql: string }[] = [
    {
      version: 1,
      sql: `
        CREATE TABLE IF NOT EXISTS providers (
          id TEXT PRIMARY KEY,
          definition_id TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          auth_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'disconnected',
          encrypted_key TEXT,
          api_base_url TEXT,
          models_json TEXT NOT NULL DEFAULT '[]',
          free_tier INTEGER NOT NULL DEFAULT 0,
          rating REAL,
          last_health TEXT,
          last_error TEXT,
          requests_total INTEGER NOT NULL DEFAULT 0,
          tokens_total INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_providers_definition ON providers(definition_id);

        CREATE TABLE IF NOT EXISTS combos (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          strategy TEXT NOT NULL,
          config_json TEXT NOT NULL DEFAULT '{}',
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_combos_active ON combos(active);

        CREATE TABLE IF NOT EXISTS api_keys (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          prefix TEXT NOT NULL UNIQUE,
          hash TEXT NOT NULL UNIQUE,
          scopes_json TEXT NOT NULL DEFAULT '["read","write"]',
          ip_allowlist_json TEXT NOT NULL DEFAULT '[]',
          rate_limit INTEGER NOT NULL DEFAULT 60,
          usage_tokens INTEGER NOT NULL DEFAULT 0,
          requests_total INTEGER NOT NULL DEFAULT 0,
          last_used_at TEXT,
          expires_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          twofa_enabled INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS requests (
          id TEXT PRIMARY KEY,
          model TEXT NOT NULL,
          provider TEXT NOT NULL,
          combo TEXT,
          tokens_in INTEGER NOT NULL DEFAULT 0,
          tokens_out INTEGER NOT NULL DEFAULT 0,
          cost REAL NOT NULL DEFAULT 0,
          latency_ms REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'ok',
          error TEXT,
          compression_saved INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);
        CREATE INDEX IF NOT EXISTS idx_requests_provider ON requests(provider);

        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          payload_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

        CREATE TABLE IF NOT EXISTS audit (
          id TEXT PRIMARY KEY,
          actor TEXT NOT NULL,
          action TEXT NOT NULL,
          resource TEXT NOT NULL,
          ip TEXT,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `,
    },
  ];

  const mark = database.prepare("INSERT OR IGNORE INTO _migrations(version) VALUES (?)");
  const tx = database.transaction(() => {
    for (const migration of migrations) {
      if (migration.version <= current) continue;
      database.exec(migration.sql);
      mark.run(migration.version);
    }
  });
  tx();
}

function seed(database: Database.Database) {
  const defaults: Record<string, string> = {
    "app.name": "OmniRoute",
    "app.mode": "local",
    "app.theme": "dark",
    "app.language": "en",
    "security.encryptionEnabled": "1",
    "guardrails.enabled": "1",
    "guardrails.secretMasking": "1",
    "compression.activeProfile": "standard",
    "compression.enabled": "1",
    "routing.defaultCombo": "auto",
    "monitor.retentionDays": "90",
  };
  const insert = database.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(defaults)) {
    insert.run(key, value);
  }
}

export function getSetting(key: string, fallback = ""): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : fallback;
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      "INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}

export function logEvent(type: string, payload: Record<string, unknown>) {
  getDb()
    .prepare("INSERT INTO events(id, type, payload_json) VALUES (?, ?, ?)")
    .run(newId(), type, JSON.stringify(payload));
}

export function audit(actor: string, action: string, resource: string, ip?: string, metadata?: Record<string, unknown>) {
  getDb()
    .prepare("INSERT INTO audit(id, actor, action, resource, ip, metadata_json) VALUES (?, ?, ?, ?, ?, ?)")
    .run(newId(), actor, action, resource, ip ?? "", JSON.stringify(metadata ?? {}));
}

// close for tests / graceful shutdown
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
