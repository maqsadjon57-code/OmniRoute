"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Filter, RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogProvider {
  id: string;
  name: string;
  category: string;
  authType: string;
  apiBaseUrl: string;
  freeTier: boolean;
  freeTierNote?: string;
  rating: number;
  models: { id: string; name: string; context: number; free: boolean }[];
}

interface Connected {
  id: string;
  definitionId: string;
  name: string;
  category: string;
  status: string;
  freeTier: boolean;
  rating: number;
  models: { id: string; name: string }[];
  lastError: string | null;
  requestsTotal: number;
  tokensTotal: number;
}

const CATEGORIES = ["All", "chat", "image", "audio", "search", "local", "cloud-agent", "system"];

export default function ProvidersPage() {
  const [catalog, setCatalog] = useState<CatalogProvider[]>([]);
  const [connected, setConnected] = useState<Connected[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [selected, setSelected] = useState<CatalogProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/providers/catalog").then((r) => r.json()).then((d) => setCatalog(d.providers ?? []));
    fetch("/api/providers").then((r) => r.json()).then(setConnected);
  }, []);

  const filtered = useMemo(() => {
    return catalog.filter((p) => {
      if (query && !`${p.name} ${p.models.map((m) => m.id).join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== "All" && p.category !== category) return false;
      if (freeOnly && !p.freeTier) return false;
      return true;
    });
  }, [catalog, query, category, freeOnly]);

  const connectedByDef = useMemo(() => new Map(connected.map((c) => [c.definitionId, c])), [connected]);

  function connect() {
    setBusy(true);
    setMessage("");
    fetch(`/api/providers/${selected!.id}/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ definitionId: selected!.id, apiKey: apiKey || undefined }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setMessage(`Error: ${d.error}`);
        else {
          setMessage(`Connected ${d.name}.`);
          setSelected(null);
          setApiKey("");
          fetch("/api/providers").then((r) => r.json()).then(setConnected);
        }
      })
      .catch((e) => setMessage(String(e)))
      .finally(() => setBusy(false));
  }

  function disconnect(providerId: string) {
    fetch(`/api/providers/${providerId}/disconnect`, { method: "POST" })
      .then(() => fetch("/api/providers").then((r) => r.json()).then(setConnected));
  }

  function test(providerId: string) {
    fetch(`/api/providers/${providerId}/test`, { method: "POST" })
      .then(() => fetch("/api/providers").then((r) => r.json()).then(setConnected));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Providers</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {catalog.length} in catalog · {connected.length} connected</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-semibold">{connected.filter((c) => c.status === "connected").length} active</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search providers and models..." className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border bg-background px-4 py-2.5 text-sm outline-none">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setFreeOnly((v) => !v)} className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm", freeOnly && "border-emerald-500/40 bg-emerald-500/10 text-emerald-500")}>
          <Filter className="h-4 w-4" /> Free only
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const isConnected = connectedByDef.has(p.id);
          const c = isConnected ? connectedByDef.get(p.id) : undefined;
          return (
            <div key={p.id} className={cn("rounded-2xl border p-5", isConnected && "border-emerald-500/30")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{p.name}</h3>
                    {p.freeTier && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">FREE</span>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.category} · {p.authType} · Elo {p.rating}</div>
                </div>
                <div className={cn("rounded-lg px-2 py-1 text-xs font-semibold", isConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>
                  {isConnected ? c?.status : "Not connected"}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {p.models.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs">
                    <span className="font-mono">{m.id}</span>
                    <span className="text-muted-foreground">{m.context ? `${Math.round(m.context / 1000)}K` : "—"}</span>
                  </div>
                ))}
                {p.models.length > 3 && <div className="px-1 text-[10px] text-muted-foreground">+ {p.models.length - 3} more</div>}
              </div>
              {p.freeTierNote && <p className="mt-3 text-xs text-emerald-500/80">{p.freeTierNote}</p>}
              {isConnected && c && (
                <p className="mt-3 truncate text-[11px] text-muted-foreground">{c.tokensTotal} tokens · {c.requestsTotal} requests {c.lastError ? `· ${c.lastError}` : ""}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setSelected(p)} className="flex-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                  {isConnected ? "Reconnect" : "Connect"}
                </button>
                {isConnected && c && (
                  <>
                    <button onClick={() => test(c.id)} className="rounded-xl border px-3 py-2 text-sm hover:bg-muted" title="Test"><RefreshCw className="h-4 w-4" /></button>
                    <button onClick={() => disconnect(c.id)} className="rounded-xl border px-3 py-2 text-sm text-red-500 hover:bg-red-500/10" title="Disconnect"><X className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Connect {selected.name}</h2>
                <p className="text-xs text-muted-foreground">{selected.apiBaseUrl}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5">
              <label className="text-xs font-semibold">API key</label>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder={selected.authType === "keyless" ? "keyless — leave empty" : "sk-..."} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" />
              {selected.authType === "keyless" && <p className="mt-2 text-xs text-muted-foreground">This provider requires no credential. OmniRoute will connect it in keyless mode.</p>}
              {selected.authType === "oauth" && <p className="mt-2 text-xs text-muted-foreground">OAuth flow available in a future build; for now paste an existing access token.</p>}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border bg-emerald-500/5 p-3 text-xs text-emerald-500">
              <Check className="h-4 w-4" /> Stored with AES-256-GCM encryption.
            </div>
            {message && <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"><AlertCircle className="mb-1 h-4 w-4" /> {message}</div>}
            <div className="mt-5 flex gap-2">
              <button onClick={connect} disabled={busy} className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {busy ? "Connecting..." : "Connect"}
              </button>
              <button onClick={() => setSelected(null)} className="rounded-xl border px-4 py-2.5 text-sm hover:bg-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
