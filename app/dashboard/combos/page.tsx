"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import { ROUTING_STRATEGIES } from "@/lib/types";

interface Combo {
  id: string;
  name: string;
  strategy: string;
  targets: { providerId: string; modelId: string }[];
  active: boolean;
  updatedAt: string;
}

interface ConnectedProvider {
  id: string;
  name: string;
  status: string;
  models: { id: string; name: string }[];
}

const PRESETS = ["auto", "auto/coding", "auto/fast", "auto/cheap", "auto/offline", "auto/smart", "auto/lkgp", "auto/chaos"];

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [providers, setProviders] = useState<ConnectedProvider[]>([]);
  const [name, setName] = useState("my-combo");
  const [strategy, setStrategy] = useState("auto");
  const [targets, setTargets] = useState<{ providerId: string; modelId: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/combos").then((r) => r.json()).then(setCombos);
  }
  useEffect(() => {
    load();
    fetch("/api/providers").then((r) => r.json()).then((list: ConnectedProvider[]) => setProviders(list.filter((p) => p.status === "connected")));
  }, []);

  const activeProviders = useMemo(() => providers.map((p) => p.id), [providers]);

  function addTarget(providerId: string) {
    const p = providers.find((x) => x.id === providerId);
    if (!p || !p.models[0]) return;
    if (targets.some((t) => t.providerId === providerId)) return;
    setTargets([...targets, { providerId, modelId: p.models[0].id }]);
  }

  function create() {
    setBusy(true);
    setMsg("");
    fetch("/api/combos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, strategy, targets, active: true }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setMsg(d.error);
        else {
          setName("my-combo");
          setTargets([]);
          load();
          setMsg("Combo created.");
        }
      })
      .finally(() => setBusy(false));
  }

  function del(id: string) {
    fetch(`/api/combos/${id}`, { method: "DELETE" }).then(load);
  }

  function testCombo() {
    fetch("/api/combos/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ combo: name }),
    })
      .then((r) => r.json())
      .then((d) => setMsg(d.ok ? `Route test: matched ${d.target.providerId} via ${d.decision}` : `Error: ${d.error}`));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Combos</h1>
        <p className="text-sm text-muted-foreground">{combos.filter((c) => c.active).length} active · {combos.length} total</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border">
            <div className="border-b p-5">
              <h2 className="font-bold">Existing combos</h2>
            </div>
            <div className="divide-y">
              {combos.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No combos yet. Create one or restart to seed presets.</div>}
              {combos.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.name}</span>
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">{c.strategy}</span>
                      {c.active && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-500">active</span>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.targets.length} targets · updated {new Date(c.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={testCombo} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">Test</button>
                    <button onClick={() => del(c.id)} className="rounded-lg border px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border">
            <div className="border-b p-5">
              <h2 className="font-bold">Presets</h2>
            </div>
            <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setName(p)} className="rounded-xl border p-3 text-left text-sm transition-colors hover:border-violet-500/40">
                  <div className="flex items-center gap-1 font-semibold"><Zap className="h-3.5 w-3.5 text-violet-400" />{p}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{p.includes("cheap") ? "Cheapest per token" : p.includes("fast") ? "Lowest latency" : p.includes("coding") ? "Quality-first" : p.includes("offline") ? "Most quota headroom" : "Balanced default"}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-5 lg:sticky lg:top-24">
          <h2 className="font-bold">Create combo</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold">Strategy</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
                {ROUTING_STRATEGIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">Targets ({targets.length})</label>
              <div className="mt-1 space-y-2">
                {activeProviders.length === 0 && <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">Connect at least one provider.</div>}
                {activeProviders.map((id) => (
                  <button key={id} onClick={() => addTarget(id)} className="w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors hover:border-violet-500/40">
                    <Plus className="mr-2 inline h-3.5 w-3.5 text-violet-400" />{providers.find((p) => p.id === id)?.name}
                  </button>
                ))}
                {targets.map((t) => (
                  <div key={t.providerId} className="flex items-center justify-between rounded-xl border bg-violet-500/5 px-3 py-2 text-sm">
                    <span className="truncate">{providers.find((p) => p.id === t.providerId)?.name} · {t.modelId}</span>
                    <ResetX onClick={() => setTargets(targets.filter((x) => x.providerId !== t.providerId))} />
                  </div>
                ))}
              </div>
            </div>
            {msg && <div className="rounded-xl border bg-muted/40 p-3 text-xs">{msg}</div>}
            <div className="flex gap-2">
              <button onClick={create} disabled={busy || !name || targets.length === 0} className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {busy ? "Creating..." : "Create combo"}
              </button>
              <button onClick={testCombo} className="rounded-xl border px-4 py-2.5 text-sm hover:bg-muted"><RefreshCw className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetX({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded p-1 text-red-400 hover:bg-red-500/10">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
