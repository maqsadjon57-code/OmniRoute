import { SiteShell } from "@/components/site-shell";

const VERSIONS = [
  { v: "0.1.0", date: "2026-09-01", notes: ["Initial OmniRoute release", "OpenAI-compatible /v1 endpoints", "Dashboard with providers, combos, keys", "19 routing strategies", "12 compression engines", "MCP + A2A stubs"] },
];

export default function ChangelogPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">Changelog</h1>
        <div className="mt-10 space-y-6">
          {VERSIONS.map((v) => (
            <div key={v.v} className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-black">v{v.v}</div>
                <div className="text-xs text-muted-foreground">{v.date}</div>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{v.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
