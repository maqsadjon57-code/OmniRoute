import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">About</h1>
        <p className="mt-4 text-lg text-muted-foreground">OmniRoute is an open-source universal AI gateway, built so developers never have to stop coding because a provider ran out of quota.</p>
        <div className="mt-10 grid gap-4">
          {[
            ["2015", "The idea", "Frustrated by juggling dozens of provider keys and free tiers, we started sketching a single endpoint."],
            ["2016", "Routing engine", "The 19-strategy routing and circuit-breaker engine took shape."],
            ["2017", "Compression", "12 compression engines including RTK raised savings from 15% to 95%."],
            ["2018", "Community", "550+ contributors joined to add providers, languages and integrations."],
            ["2026", "OmniRoute now", "352 providers, 150+ free tiers, MCP, A2A, desktop, Termux and PWA — fully open source."],
          ].map(([year, title, body]) => (
            <div key={year} className="rounded-2xl border p-5">
              <div className="text-xs font-bold text-violet-400">{year}</div>
              <div className="mt-1 font-bold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
