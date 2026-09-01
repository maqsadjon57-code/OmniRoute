"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { TokensChart, CostChart, ProviderPie } from "@/components/dashboard/usage-chart";
import { formatMoney, formatTokens } from "@/lib/utils";

interface Summary {
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

interface Recent {
  id: string;
  model: string;
  provider: string;
  combo: string | null;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  latencyMs: number;
  status: string;
  compressionSaved: number;
  createdAt: string;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [providers, setProviders] = useState<{ provider: string; requests: number; tokensIn: number; tokensOut: number; cost: number; savings: number }[]>([]);
  const [byDay, setByDay] = useState<any[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then((d) => {
      setSummary(d.summary);
      setProviders(d.providers ?? []);
      setByDay(d.byDay ?? []);
      setRecent(d.recent ?? []);
    });
  }, []);

  function csv() {
    const rows = [
      ["id", "model", "provider", "combo", "tokens_in", "tokens_out", "cost", "latency_ms", "status", "saved", "created_at"],
      ...recent.map((r) => [r.id, r.model, r.provider, r.combo ?? "", r.tokensIn, r.tokensOut, r.cost, r.latencyMs, r.status, r.compressionSaved, r.createdAt]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "omniroute-requests.csv";
    a.click();
  }

  const bins = [
    { label: "Total requests", value: String(summary?.requestsTotal ?? 0) },
    { label: "Success", value: `${summary?.okRequests ?? 0} (${summary ? Math.round((summary.okRequests / Math.max(1, summary.requestsTotal)) * 100) : 0}%)` },
    { label: "Errors", value: String(summary?.errorRequests ?? 0) },
    { label: "Cost", value: formatMoney(summary?.cost ?? 0) },
    { label: "Saved", value: formatTokens(summary?.savings ?? 0) },
    { label: "p50 / p95 / p99", value: `${Math.round(summary?.p50 ?? 0)} / ${Math.round(summary?.p95 ?? 0)} / ${Math.round(summary?.p99 ?? 0)}ms` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Analytics</h1>
          <p className="text-sm text-muted-foreground">Usage, cost, latency and errors.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={csv} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-muted"><Download className="h-4 w-4" /> CSV</button>
          <button className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-muted"><FileText className="h-4 w-4" /> PDF</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {bins.map((b) => (
          <div key={b.label} className="rounded-2xl border p-4">
            <div className="text-[11px] uppercase text-muted-foreground">{b.label}</div>
            <div className="mt-2 text-xl font-black">{b.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-5 lg:col-span-2"><h2 className="mb-4 font-bold">Tokens · 30 days</h2><TokensChart data={byDay} /></div>
        <div className="rounded-2xl border p-5"><h2 className="mb-4 font-bold">Provider share</h2><ProviderPie data={providers} /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-5 lg:col-span-2"><h2 className="mb-4 font-bold">Cost · 30 days</h2><CostChart data={byDay} /></div>
        <div className="rounded-2xl border p-5">
          <h2 className="mb-4 font-bold">By provider</h2>
          <div className="space-y-2">
            {providers.slice(0, 8).map((p) => (
              <div key={p.provider} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
                <span className="truncate">{p.provider}</span>
                <span className="text-xs text-muted-foreground">{formatTokens(p.tokensIn + p.tokensOut)} · ${p.cost.toFixed(4)}</span>
              </div>
            ))}
            {providers.length === 0 && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No data yet.</div>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-bold">Recent requests</h2>
          <span className="text-xs text-muted-foreground">{recent.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b">
                <th className="px-5 py-3">Time</th><th className="px-5 py-3">Model</th><th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Combo</th><th className="px-5 py-3">Tokens</th><th className="px-5 py-3">Cost</th>
                <th className="px-5 py-3">Latency</th><th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-xs">{r.model}</td>
                  <td className="px-5 py-3">{r.provider}</td>
                  <td className="px-5 py-3 text-xs">{r.combo ?? "—"}</td>
                  <td className="px-5 py-3">{r.tokensIn + r.tokensOut}</td>
                  <td className="px-5 py-3">{formatMoney(r.cost)}</td>
                  <td className="px-5 py-3">{Math.round(r.latencyMs)}ms</td>
                  <td className="px-5 py-3">
                    {r.status === "ok" ? <span className="text-emerald-500">OK</span> : <span className="text-red-500">Error</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
