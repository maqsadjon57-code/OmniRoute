import { getDb } from "@/lib/db";
import { getProvider, listProviders } from "@/lib/providers/service";
import { newId } from "@/lib/utils";
import type { ComboConfig, RoutingStrategy } from "@/lib/types";

const PRESET_COMBOS: { name: string; strategy: RoutingStrategy; description: string }[] = [
  { name: "auto", strategy: "auto", description: "Balanced default" },
  { name: "auto/coding", strategy: "auto", description: "Quality-first" },
  { name: "auto/fast", strategy: "auto", description: "Lowest latency" },
  { name: "auto/cheap", strategy: "auto", description: "Cheapest per token" },
  { name: "auto/offline", strategy: "auto", description: "Most quota headroom" },
  { name: "auto/smart", strategy: "auto", description: "Quality + 10% exploration" },
  { name: "auto/lkgp", strategy: "lkgp", description: "Explicit stickiness" },
  { name: "auto/chaos", strategy: "random", description: "Fault-injection testing" },
];

export function listCombos(): ComboConfig[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM combos ORDER BY updated_at DESC").all();
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    strategy: String(r.strategy) as RoutingStrategy,
    targets: JSON.parse(String(r.config_json ?? "{}")).targets ?? [],
    active: Boolean(r.active),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

export function getCombo(idOrName: string): ComboConfig | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM combos WHERE id = ? OR name = ?").get(idOrName, idOrName) as
    | Record<string, unknown>
    | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    strategy: String(row.strategy) as RoutingStrategy,
    targets: (JSON.parse(String(row.config_json ?? "{}")) as ComboConfig).targets ?? [],
    active: Boolean(row.active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function createCombo(opts: { name: string; strategy: RoutingStrategy; targets: ComboConfig["targets"]; active?: boolean }): ComboConfig {
  const db = getDb();
  const id = newId("combo");
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO combos(id, name, strategy, config_json, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    opts.name,
    opts.strategy,
    JSON.stringify({ targets: opts.targets }),
    opts.active === false ? 0 : 1,
    now,
    now,
  );
  return getCombo(id)!;
}

export function updateCombo(id: string, patch: Partial<Omit<ComboConfig, "id" | "createdAt">>): ComboConfig {
  const db = getDb();
  const existing = getCombo(id);
  if (!existing) throw new Error("Combo not found");
  const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  db.prepare(
    `UPDATE combos SET name = ?, strategy = ?, config_json = ?, active = ?, updated_at = ? WHERE id = ?`,
  ).run(
    next.name,
    next.strategy,
    JSON.stringify({ targets: next.targets }),
    next.active ? 1 : 0,
    next.updatedAt,
    id,
  );
  return getCombo(id)!;
}

export function deleteCombo(id: string) {
  getDb().prepare("DELETE FROM combos WHERE id = ?").run(id);
}

export function autoComboTargets(comboName: string, limit = 8): { providerId: string; modelId: string }[] {
  const name = comboName.startsWith("auto") ? comboName : "auto";
  const isCheap = name.includes("cheap") || name.includes("offline");
  const isFast = name.includes("fast");
  const isCoding = name.includes("coding");
  const all = listProviders().filter((p) => p.status === "connected" && p.encryptedKey !== undefined);
  const connected = all.length ? all : listProviders().filter((p) => p.freeTier || p.status === "connected");
  const scored = connected
    .map((p) => {
      const model = p.models.find((m) => (isCoding ? /code|reason|r1|deepseek|qwen|grok/i.test(m.id) : true)) ?? p.models[0];
      if (!model) return null;
      const price = (model.price.input + model.price.output) / 2;
      const free = model.free || p.freeTier;
      let score = free ? 40 : 0;
      score += p.rating * 0.4;
      score -= price * 4;
      if (isCheap) score += free ? 100 : -price * 20;
      if (isFast) score += p.category === "local" ? 60 : 0;
      if (isCoding) score += p.category === "chat" ? 20 : 0;
      return { providerId: p.id, modelId: model.id, score };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ providerId, modelId }) => ({ providerId, modelId }));
}

export function createPresetCombosIfMissing() {
  const db = getDb();
  const count = (db.prepare("SELECT COUNT(*) AS c FROM combos").get() as { c: number }).c;
  if (count > 0) return;
  const targets = autoComboTargets("auto", 5);
  for (const preset of PRESET_COMBOS) {
    const combo = listCombos().find((c) => c.name === preset.name);
    if (!combo) {
      createCombo({ name: preset.name, strategy: preset.strategy, targets });
    }
  }
}

export function resolveTargetForCombo(combo: ComboConfig): ComboConfig["targets"][number] | null {
  if (!combo.active || combo.targets.length === 0) return null;
  const strategy = combo.strategy;
  const targets = combo.targets.filter((t) => {
    const p = getProvider(t.providerId);
    return p && p.status === "connected";
  });
  if (targets.length === 0) return null;
  const now = Date.now();
  switch (strategy) {
    case "priority":
    case "fill-first":
    case "lkgp":
      return targets[0];
    case "round-robin": {
      // derive counter from request id/updated timestamp to be deterministic-ish
      const idx = Math.floor(now / 1000) % targets.length;
      return targets[idx];
    }
    case "random":
    case "strict-random":
      return targets[Math.floor(Math.random() * targets.length)];
    case "weighted": {
      const weights = targets.map((t) => combo.weights?.[`${t.providerId}:${t.modelId}`] ?? t.weight ?? 1);
      return pickWeighted(targets, weights);
    }
    case "p2c": {
      const a = targets[Math.floor(Math.random() * targets.length)];
      const b = targets[Math.floor(Math.random() * targets.length)];
      return Math.random() < 0.5 ? a : b;
    }
    case "least-used": {
      return [...targets].sort((a, b) => {
        const pa = getProvider(a.providerId);
        const pb = getProvider(b.providerId);
        return (pa?.requestsTotal ?? 0) - (pb?.requestsTotal ?? 0);
      })[0];
    }
    case "cost-optimized": {
      return [...targets].sort((a, b) => {
        const pa = getProvider(a.providerId);
        const pb = getProvider(b.providerId);
        const ca = pa?.models.find((m) => m.id === a.modelId);
        const cb = pb?.models.find((m) => m.id === b.modelId);
        return (ca?.price.input ?? 0) - (cb?.price.input ?? 0);
      })[0];
    }
    case "headroom":
    case "reset-window":
    case "reset-aware":
    case "context-optimized":
    case "context-relay":
    case "cache-optimized":
      // These strategies use live telemetry; fall back to priority for now.
      return targets[0];
    case "auto":
    default: {
      const sorted = [...targets].sort((a, b) => {
        const pa = getProvider(a.providerId);
        const pb = getProvider(b.providerId);
        return (pb?.rating ?? 0) - (pa?.rating ?? 0);
      });
      return sorted[0];
    }
  }
}

function pickWeighted(items: ComboConfig["targets"], weights: number[]): ComboConfig["targets"][number] {
  const total = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0) return items[0];
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
