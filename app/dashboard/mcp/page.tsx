"use client";

import { useEffect, useState } from "react";
import { Blocks, FileJson, Network, Server, ShieldCheck } from "lucide-react";

export default function McpPage() {
  const [toolCount, setToolCount] = useState(0);
  const [agent, setAgent] = useState<{ name?: string; skills?: { id: string; name: string }[] } | null>(null);

  useEffect(() => {
    fetch("/api/mcp/stream")
      .then((r) => r.json())
      .then((d) => { setToolCount(d.tools ?? 0); });
    fetch("/.well-known/agent.json")
      .then((r) => r.json())
      .then(setAgent);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">MCP & A2A</h1>
        <p className="text-sm text-muted-foreground">110 MCP tools · stdio/HTTP/SSE · Agent Card</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><Server className="h-5 w-5 text-violet-400" /> MCP tools <b>{toolCount || "—"}</b></Card>
        <Card><Blocks className="h-5 w-5 text-blue-400" /> Transports <b>stdio/HTTP/SSE</b></Card>
        <Card><ShieldCheck className="h-5 w-5 text-emerald-400" /> Scopes <b>33</b></Card>
        <Card><Network className="h-5 w-5 text-amber-400" /> A2A skills <b>{agent?.skills?.length ?? 6}</b></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="font-bold">MCP server</h2>
          <div className="mt-4 space-y-2 font-mono text-sm">
            <div className="rounded-xl border p-3">GET /api/mcp/sse</div>
            <div className="rounded-xl border p-3">POST /api/mcp/stream</div>
            <div className="rounded-xl border p-3">stdio · npx omniroute mcp</div>
          </div>
          <div className="mt-4 rounded-xl border bg-emerald-500/5 p-4 text-xs text-emerald-500">Audit trail enabled · every tool call logged.</div>
        </div>
        <div className="rounded-2xl border p-5">
          <h2 className="flex items-center gap-2 font-bold"><FileJson className="h-4 w-4 text-violet-400" /> A2A Agent Card</h2>
          <p className="mt-2 text-xs text-muted-foreground">Exposed at /.well-known/agent.json</p>
          <div className="mt-4 space-y-2">
            {(agent?.skills ?? [
              { id: "list-providers", name: "List Providers" },
              { id: "route-request", name: "Route Request" },
              { id: "compress-context", name: "Compress Context" },
              { id: "monitor-usage", name: "Monitor Usage" },
              { id: "manage-keys", name: "Manage Keys" },
              { id: "run-integration", name: "Run Integration" },
            ]).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border p-5 text-sm">{children}</div>;
}
