"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Eye, EyeOff, KeyRound, Plus, Trash2 } from "lucide-react";
import { formatTokens } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  rateLimit: number;
  usageTokens: number;
  requestsTotal: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read", "write"]);
  const [rateLimit, setRateLimit] = useState(60);
  const [created, setCreated] = useState<{ key: string; name: string } | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/keys").then((r) => r.json()).then(setKeys);
  }
  useEffect(() => { load(); }, []);

  function create() {
    setBusy(true);
    fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "New key", scopes, rateLimit }),
    })
      .then((r) => r.json())
      .then((d) => {
        setCreated({ key: d.key, name: d.name });
        setName("");
        load();
      })
      .finally(() => setBusy(false));
  }

  function revoke(id: string) {
    fetch(`/api/keys/${id}`, { method: "DELETE" }).then(load);
  }

  function toggle(s: string) {
    setScopes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function copy() {
    if (created) navigator.clipboard?.writeText(created.key);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Keys & Security</h1>
        <p className="text-sm text-muted-foreground">Gateway API keys, scopes and encryption status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">API keys</h2>
            <span className="text-xs text-muted-foreground">{keys.length} active</span>
          </div>
          <div className="space-y-3">
            {keys.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No keys yet. Create one to expose the OpenAI-compatible endpoint.</div>}
            {keys.map((k) => (
              <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    {k.name}
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px]">{k.prefix}…</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {k.scopes.join(", ")} · {k.rateLimit}/min · {formatTokens(k.usageTokens)} tokens · {k.requestsTotal} requests
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Last used {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "never"}</div>
                </div>
                <button onClick={() => revoke(k.id)} className="rounded-xl border px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5 lg:sticky lg:top-24">
          <h2 className="font-bold">Create key</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Claude Code" className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold">Scopes</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["read", "write", "admin"].map((s) => (
                  <button key={s} onClick={() => toggle(s)} className={cn("rounded-lg border px-3 py-1.5 text-xs", scopes.includes(s) ? "border-violet-500/40 bg-violet-500/10 text-violet-400" : "text-muted-foreground")}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Rate limit (req/min)</label>
              <input value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value))} type="number" min={1} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none" />
            </div>
            <button onClick={create} disabled={busy} className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              <Plus className="mr-2 inline h-4 w-4" />{busy ? "Creating..." : "Create key"}
            </button>
            <div className="flex items-center gap-2 rounded-xl border bg-emerald-500/5 p-3 text-xs text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Secrets encrypted with AES-256-GCM.
            </div>
          </div>
        </div>
      </div>

      {created && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold">Key created</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">This is the only time the full key is shown. Store it securely.</p>
            <div className="mt-4 rounded-xl border bg-muted/40 p-4 font-mono text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("break-all", !show && "blur-sm")}>{created.key}</span>
                <div className="flex gap-1">
                  <button onClick={() => setShow(!show)} className="rounded p-1 hover:bg-muted">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  <button onClick={copy} className="rounded p-1 hover:bg-muted"><Copy className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border bg-violet-500/5 p-3 font-mono text-xs text-violet-300">
              <div>Base URL: http://localhost:20128/v1</div>
              <div>Authorization: Bearer {created.key.slice(0, 12)}…</div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setCreated(null); setShow(false); }} className="rounded-xl border px-4 py-2 text-sm hover:bg-muted">Done</button>
              <button onClick={copy} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><Copy className="mr-2 inline h-4 w-4" />Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
