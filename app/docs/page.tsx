import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { BookOpen, Rocket, Terminal, Wrench } from "lucide-react";

const SECTIONS = [
  { id: "quickstart", title: "Quickstart", icon: Rocket },
  { id: "endpoints", title: "API endpoints", icon: Terminal },
  { id: "routing", title: "Routing & combos", icon: Wrench },
  { id: "compression", title: "Compression", icon: BookOpen },
  { id: "integrations", title: "Integrations", icon: Terminal },
  { id: "deploy", title: "Deploy", icon: Rocket },
];

export default function DocsPage() {
  return (
    <SiteShell>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <s.icon className="h-4 w-4" /> {s.title}
              </a>
            ))}
          </div>
        </aside>
        <article className="prose prose-slate dark:prose-invert max-w-3xl">
          <h1 className="text-4xl font-black">Documentation</h1>
          <p className="text-lg text-muted-foreground">Everything you need to run the universal AI gateway.</p>

          <section id="quickstart" className="mt-10">
            <h2 className="text-2xl font-black">Quickstart</h2>
            <p className="mt-3 text-muted-foreground">Install globally and start in under a minute.</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-sm text-emerald-300">{`npm install -g omniroute
omniroute run
# → OmniRoute listening on http://localhost:20128`}</pre>
          </section>

          <section id="endpoints" className="mt-10">
            <h2 className="text-2xl font-black">API endpoints</h2>
            <p className="mt-3 text-muted-foreground">The gateway is OpenAI-compatible. Use any OpenAI SDK.</p>
            <div className="mt-4 space-y-2">
              {[
                ["POST", "/v1/chat/completions", "Chat completions (stream + non-stream)"],
                ["GET", "/v1/models", "List connected models"],
                ["POST", "/v1/responses", "Responses API compatibility"],
                ["POST", "/v1/embeddings", "Embeddings"],
                ["POST", "/v1/images/generations", "Image generation"],
                ["POST", "/v1/audio/transcriptions", "Audio transcription"],
                ["POST", "/v1/ocr", "OCR"],
                ["POST", "/v1/files", "File upload"],
                ["POST", "/v1/batches", "Batch API"],
              ].map(([m, p, d]) => (
                <div key={p} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                  <span className="w-14 rounded-md bg-violet-500/10 px-2 py-1 text-center text-xs font-bold text-violet-400">{m}</span>
                  <code className="font-mono text-xs">{p}</code>
                  <span className="hidden text-muted-foreground sm:block">{d}</span>
                </div>
              ))}
            </div>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-sm text-emerald-300">{`curl http://localhost:20128/v1/chat/completions \\
  -H "Authorization: Bearer or_sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto/coding",
    "messages": [{"role":"user","content":"Explain React re-renders"}]
  }'`}</pre>
          </section>

          <section id="routing" className="mt-10">
            <h2 className="text-2xl font-black">Routing & combos</h2>
            <p className="mt-3 text-muted-foreground">Use auto channels, combo names, or <code>provider/model</code> syntax.</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><code>model: "auto"</code> — balanced auto routing</li>
              <li><code>model: "auto/coding"</code> — quality-first</li>
              <li><code>model: "auto/cheap"</code> — cheapest per token</li>
              <li><code>model: "deepseek/deepseek-chat"</code> — direct route</li>
            </ul>
          </section>

          <section id="compression" className="mt-10">
            <h2 className="text-2xl font-black">Compression</h2>
            <p className="mt-3 text-muted-foreground">Per-request override via headers.</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-sm text-emerald-300">{`X-OmniRoute-Compression: rtk      # per-request profile
X-OmniRoute-Compression: off      # disable
# Response headers
X-OmniRoute-Decision: combo=auto/coding strategy=auto
X-OmniRoute-Compression: 68%
X-OmniRoute-Cost: 0.000312`}</pre>
          </section>

          <section id="integrations" className="mt-10">
            <h2 className="text-2xl font-black">Integrations</h2>
            <p className="mt-3 text-muted-foreground">All 36+ tools accept environment-based base URLs.</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-sm text-emerald-300">{`export ANTHROPIC_BASE_URL=http://localhost:20128/v1
export ANTHROPIC_API_KEY=or_sk_live_...
claude`}</pre>
          </section>

          <section id="deploy" className="mt-10">
            <h2 className="text-2xl font-black">Deploy</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Docker", "docker run -p 20128:20128 diegosouzapw/omniroute"],
                ["npm", "npm install -g omniroute && omniroute run"],
                ["Source", "git clone ... && npm install && npm run dev"],
                ["Nix", "nix run github:maqsadjon57-code/OmniRoute"],
              ].map(([name, cmd]) => (
                <div key={name} className="rounded-xl border p-4">
                  <div className="text-sm font-bold">{name}</div>
                  <code className="mt-2 block break-all font-mono text-xs text-muted-foreground">{cmd}</code>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 rounded-2xl border p-6">
            <h2 className="text-lg font-bold">Ready to try it?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Open the dashboard and connect your first provider.</p>
            <Link href="/dashboard" className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">Open Dashboard</Link>
          </div>
        </article>
      </div>
    </SiteShell>
  );
}
