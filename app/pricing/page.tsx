import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Self-hosted",
    price: "$0",
    tag: "MIT · forever",
    features: ["All 352+ providers", "150+ free tiers", "19 routing strategies", "12 compression engines", "MCP + A2A", "No rate limits", "Your own server"],
  },
  {
    name: "Cloud",
    price: "Free",
    tag: "start without a card",
    features: ["~1.51B free tokens/mo", "Free provider pool", "Shared dashboard", "Community support", "40 requests/min"],
  },
  {
    name: "Team",
    price: "$29/mo",
    tag: "for builders",
    features: ["All cloud features", "Multi-user roles", "Priority routing", "Unlimited requests/min", "Webhooks + analytics", "Email support"],
  },
];

export default function PricingPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">Pricing</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Start free forever. Self-host with no limits, or use the cloud with managed free tiers.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.name}</h2>
                <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-400">{t.tag}</span>
              </div>
              <div className="mt-4 text-4xl font-black">{t.price}</div>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{f}</li>)}
              </ul>
              <Link href="/dashboard" className="mt-8 block rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90">Get started</Link>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
