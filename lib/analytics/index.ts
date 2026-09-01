import { getDb } from "@/lib/db";
import { newId } from "@/lib/utils";
import type { RequestRecord } from "@/lib/types";

export interface AnalyticsSummary {
  requestsTotal: number;
  okRequests: number;
  errorRequests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  savings: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface TimeBucket {
  label: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  savings: number;
  errors: number;
}

export function recordRequest(input: {
  model: string;
  provider: string;
  combo?: string | null;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  latencyMs: number;
  status: "ok" | "error" | "fallback";
  error?: string | null;
  compressionSaved?: number;
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO requests(id, model, provider, combo, tokens_in, tokens_out, cost, latency_ms, status, error, compression_saved)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    newId("req"),
    input.model,
    input.provider,
    input.combo ?? null,
    input.tokensIn,
    input.tokensOut,
    input.cost,
    input.latencyMs,
    input.status,
    input.error ?? null,
    input.compressionSaved ?? 0,
  );
  db.prepare(
    `UPDATE providers SET requests_total = requests_total + 1, tokens_total = tokens_total + ? WHERE id = ?`,
  ).run(input.tokensIn + input.tokensOut, input.provider);
}

export function summary(): AnalyticsSummary {
  const db = getDb();
  const s = db
    .prepare(
      `SELECT COUNT(*) requests,
              SUM(CASE WHEN status = 'ok' THEN 1 ELSE 0 END) okRequests,
              SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) errorRequests,
              SUM(tokens_in) tokensIn,
              SUM(tokens_out) tokensOut,
              SUM(cost) cost,
              SUM(compression_saved) savings
       FROM requests`,
    )
    .get() as Record<string, number>;
  const lat = db
    .prepare("SELECT latency_ms FROM requests ORDER BY latency_ms ASC")
    .all() as { latency_ms: number }[];
  const sorted = lat.map((r) => Number(r.latency_ms));
  function percentile(p: number) {
    if (!sorted.length) return 0;
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
  }
  return {
    requestsTotal: Number(s.requests ?? 0),
    okRequests: Number(s.okRequests ?? 0),
    errorRequests: Number(s.errorRequests ?? 0),
    tokensIn: Number(s.tokensIn ?? 0),
    tokensOut: Number(s.tokensOut ?? 0),
    cost: Number(s.cost ?? 0),
    savings: Number(s.savings ?? 0),
    p50: percentile(50),
    p95: percentile(95),
    p99: percentile(99),
  };
}

export function providerBreakdown() {
  const db = getDb();
  return db
    .prepare(
      `SELECT provider, COUNT(*) requests, SUM(tokens_in) tokensIn, SUM(tokens_out) tokensOut, SUM(cost) cost, SUM(compression_saved) savings
       FROM requests GROUP BY provider ORDER BY tokensIn DESC LIMIT 20`,
    )
    .all() as { provider: string; requests: number; tokensIn: number; tokensOut: number; cost: number; savings: number }[];
}

export function byDay(days = 30): TimeBucket[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT date(created_at) day, COUNT(*) requests,
              SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) errors,
              SUM(tokens_in) tokensIn, SUM(tokens_out) tokensOut, SUM(cost) cost, SUM(compression_saved) savings
       FROM requests
       WHERE created_at >= datetime('now', ?)
       GROUP BY day
       ORDER BY day ASC`,
    )
    .all(-days) as { day: string; requests: number; errors: number; tokensIn: number; tokensOut: number; cost: number; savings: number }[];
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: TimeBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const row = map.get(d);
    out.push({
      label: d,
      requests: Number(row?.requests ?? 0),
      errors: Number(row?.errors ?? 0),
      tokensIn: Number(row?.tokensIn ?? 0),
      tokensOut: Number(row?.tokensOut ?? 0),
      cost: Number(row?.cost ?? 0),
      savings: Number(row?.savings ?? 0),
    });
  }
  return out;
}

export function recentRequests(limit = 25): RequestRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM requests ORDER BY created_at DESC LIMIT ?").all(limit);
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    model: String(r.model),
    provider: String(r.provider),
    combo: r.combo ? String(r.combo) : null,
    tokensIn: Number(r.tokens_in),
    tokensOut: Number(r.tokens_out),
    cost: Number(r.cost),
    latencyMs: Number(r.latency_ms),
    status: String(r.status) as RequestRecord["status"],
    error: r.error ? String(r.error) : null,
    compressionSaved: Number(r.compression_saved),
    createdAt: String(r.created_at),
  }));
}

export function listEvents(limit = 50) {
  const db = getDb();
  return db
    .prepare("SELECT id, type, payload_json, created_at FROM events ORDER BY created_at DESC LIMIT ?")
    .all(limit) as { id: string; type: string; payload_json: string; created_at: string }[];
}
