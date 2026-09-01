"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Gauge, Plug, TrendingDown, Zap } from "lucide-react";
import { TokensChart, CostChart, ProviderPie } from "@/components/dashboard/usage-chart";
import { formatTokens, formatMoney } from "@/lib/utils";

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

interface ProviderRow {
  id: string;
  name: string;
  category: string;
  status: string;
  freeTier: boolean;
  rating: number;
  requestsTotal: number;
  tokensTotal: number;
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [byDay, setByDay] = useState<never[]>([]);
  const [providerData, setProviderData] = useState([]);
  const [recent, setRecent] = useState([] as { id: string; model: string; provider: string; tokensIn: number; tokensOut: number; cost: number; latencyMs: number; status: string; compressionSaved: number; createdAt: string }[]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary);
        setByDay(d.byDay ?? []);
        setProviderData(d.providers ?? []);
        setRecent(d.recent ?? []);
      });
    fetch("/api/providers").then((r) => r.json()).then(setProviders);
  }, []);

  const activeProviders = providers.filter((p) => p.status === "connected").length;
  const health = summary ? (summary.errorRequests / Math.max(1, summary.requestsTotal)) * 100 : 0;

  const kpis = [
    { label: "Active providers", value: String(activeProviders), sub: `${providers.length} total`, icon: Plug, color: "text-violet-400" },
    { label: "Tokens used", value: formatTokens((summary?.tokensIn ?? 0) + (summary?.tokensOut ?? 0)), sub: `${formatTokens(summary?.tokensIn ?? 0)} in · ${formatTokens(summary?.tokensOut ?? 0)} out`, icon: Activity, color: "text-blue-400" },
    { label: "Tokens saved", value: formatTokens(summary?.savings ?? 0), sub: "via compression", icon: TrendingDown, color: "text-emerald-400" },
    { label: "Latency p95", value: `${Math.round(summary?.p95 ?? 0)}ms`, sub: `p50 ${Math.round(summary?.p50 ?? 0)}ms`, icon: Gauge, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Overview</h1>
          <p className="text-sm text-muted-foreground">Live gateway health and usage.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs">
          <span className={`h-2 w-2 rounded-full ${health > 5 ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className="font-semibold">{health > 5 ? "Degraded" : "Healthy"}</span>
          <span className="text-muted-foreground">· {Math.round(100 - health)}% success</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</span>
              <k.icon className={`h-5 w-5 ${k.color}`} />
            </div>
            <div className="mt-3 text-3xl font-black">{k.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Token usage · 30 days</h2>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
              {formatTokens(summary?.savings ?? 0)} saved
            </span>
          </div>
          <TokensChart data={byDay} />
        </div>
        <div className="rounded-2xl border p-5">
          <h2 className="mb-4 font-bold">By provider</h2>
          <ProviderPie data={providerData} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="mb-4 font-bold">Cost daily</h2>
          <CostChart data={byDay} />
        </div>
        <div className="rounded-2xl border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Quick actions</h2>
          </div>
          <div className="grid gap-3">
            <Link href="/dashboard/providers" className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-violet-500/40">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400"><Plug className="h-4 w-4" /></span>
                <div>
                  <div className="text-sm font-semibold">Connect a provider</div>
                  <div className="text-xs text-muted-foreground">API key, OAuth or keyless</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/dashboard/combos" className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-blue-500/40">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><Zap className="h-4 w-4" /></span>
                <div>
                  <div className="text-sm font-semibold">Create a combo</div>
                  <div className="text-xs text-muted-foreground">19 routing strategies</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/dashboard/settings" className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-4 w-4" /></span>
                <div>
                  <div className="text-sm font-semibold">Health check</div>
                  <div className="text-xs text-muted-foreground">Test all providers</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-bold">Recent requests</h2>
          <Link href="/dashboard/analytics" className="text-xs font-semibold text-violet-400 hover:text-violet-300">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b">
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Latency</th>
                <th className="px-5 py-3">Tokens</th>
                <th className="px-5 py-3">Saved</th>
                <th className="px-5 py-3">Cost</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No requests yet. Point an AI tool at /v1/chat/completions.</td></tr>
              )}
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-mono text-xs">{r.model}</td>
                  <td className="px-5 py-3">{r.provider}</td>
                  <td className="px-5 py-3">{Math.round(r.latencyMs)}ms</td>
                  <td className="px-5 py-3">{r.tokensIn + r.tokensOut}</td>
                  <td className="px-5 py-3 text-emerald-500">{r.compressionSaved > 0 ? `+${r.compressionSaved}` : "—"}</td>
                  <td className="px-5 py-3">{formatMoney(r.cost)}</td>
                  <td className="px-5 py-3">
                    {r.status === "ok" ? <span className="inline-flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" />OK</span> : <span className="inline-flex items-center gap-1 text-red-500"><AlertTriangle className="h-3.5 w-3.5" />Error</span>}
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
