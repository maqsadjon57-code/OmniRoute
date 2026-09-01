"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
}

const EVENTS = ["request.completed", "request.error", "quota.low", "provider.degraded", "provider.recovered", "key.revoked"];

export default function WebhooksPage() {
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["request.completed"]);

  function load() { fetch("/api/webhooks").then((r) => r.json()).then(setHooks); }
  useEffect(load, []);

  function create() {
    fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, events }) })
      .then(() => { setUrl(""); load(); });
  }

  function remove(id: string) {
    fetch(`/api/webhooks/${id}`, { method: "DELETE" }).then(load);
  }

  function toggle(e: string) {
    setEvents((cur) => cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Webhooks</h1>
        <p className="text-sm text-muted-foreground">Notify Slack, Discord, Telegram or any custom URL.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border p-5 lg:col-span-2">
          <h2 className="font-bold">Registered webhooks</h2>
          <div className="mt-4 space-y-3">
            {hooks.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No webhooks configured.</div>}
            {hooks.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <div className="break-all font-mono text-sm">{h.url}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{h.events.join(", ")}</div>
                </div>
                <button onClick={() => remove(h.id)} className="rounded-lg border p-2 text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-5">
          <h2 className="font-bold">Create webhook</h2>
          <div className="mt-4 space-y-3">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" />
            <div>
              <label className="text-xs font-semibold">Events</label>
              <div className="mt-2 space-y-1">
                {EVENTS.map((e) => (
                  <label key={e} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <input type="checkbox" checked={events.includes(e)} onChange={() => toggle(e)} className="h-4 w-4 accent-violet-600" />
                    {e}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={create} disabled={!url} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              <Plus className="h-4 w-4" /> Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
