import Link from "next/link";
import {
  ArrowRight, Blocks, Bot, Check, Cloud, Download, Gauge, Globe2,
  MessageSquare, MonitorSmartphone, Package, Plug, Route,
  Shield, Sparkles, TrendingDown, Wallet,
  BookOpen, ChevronDown, Star, Handshake,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-script";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Providers", href: "#providers" },
  { label: "Pricing", href: "pricing" },
  { label: "Docs", href: "docs" },
  { label: "Community", href: "community" },
  { label: "Blog", href: "blog" },
];

const PROMISES = [
  {
    icon: Shield,
    title: "Resilient Fallback",
    body: "Circuit breakers, cooldowns, model lockouts and automatic failover keep your code running through outages.",
  },
  {
    icon: TrendingDown,
    title: "Up to 95% Token Savings",
    body: "12 compression engines reduce prompts by 15–95%, including RTK and Stacked RTK→Caveman.",
  },
  {
    icon: Wallet,
    title: "$0 to Start",
    body: "150+ free tiers with fair-share quota pooling. Start building today without a credit card.",
  },
  {
    icon: Plug,
    title: "36+ CI/Agent Integrations",
    body: "Claude Code, Codex, Cursor, Cline, Aider, Copilot, Goose and 36+ tools through one endpoint.",
  },
  {
    icon: Bot,
    title: "One API, Every Model",
    body: "OpenAI, Claude, Gemini, Responses, OCR, images, audio and embeddeds — all compatible.",
  },
  {
    icon: Gauge,
    title: "Production Controls",
    body: "Guardrails, MCP server, A2A protocol, audit logs, live analytics and webhooks built in.",
  },
];

const COMPARISON: { feature: string; omniroute: string; others: string }[] = [
  { feature: "AI providers", omniroute: "352+", others: "~100–300" },
  { feature: "Free tiers", omniroute: "150+", others: "None / few" },
  { feature: "Routing strategies", omniroute: "19", others: "3–5" },
  { feature: "Compression engines", omniroute: "12", others: "1" },
  { feature: "MCP tools", omniroute: "110", others: "0–20" },
  { feature: "A2A protocol", omniroute: "Yes", others: "Rare" },
  { feature: "TLS fingerprint spoofing", omniroute: "3-level proxy", others: "No" },
  { feature: "Desktop / Termux / PWA", omniroute: "All three", others: "Web only" },
  { feature: "UI languages", omniroute: "43", others: "1–3" },
];

const FREE = [
  { name: "OpenCode Zen", note: "DeepSeek V4, Nemotron 3 — No token cap", tag: "Free" },
  { name: "Kilo Code", note: "Auto-router, Tencent Hunyuan — Free forever", tag: "Free forever" },
  { name: "Requesty", note: "GPT-OSS 120B, NVIDIA Nemotron — Free forever", tag: "Free" },
  { name: "SiliconFlow", note: "DeepSeek V3.2 / R1 — Free tier", tag: "Free tier" },
  { name: "Z.AI GLM", note: "GLM-4.7 / 4.5-Flash — Free forever", tag: "Free forever" },
  { name: "Baidu ERNIE", note: "ERNIE 4.0 — Free forever", tag: "Free forever" },
  { name: "Qoder AI", note: "Qwen3-Max, Kimi-K2 — Unlimited FREE", tag: "Unlimited" },
  { name: "Pollinations", note: "GPT, Llama, Claude — No key needed", tag: "Keyless" },
  { name: "Cloudflare AI", note: "50+ models — 10K neurons/day", tag: "10K/day" },
  { name: "NVIDIA NIM", note: "GLM, MiniMax — ~40 RPM free", tag: "40 RPM" },
  { name: "Cerebras", note: "GLM 4.7, GPT-OSS — 1M tokens/day", tag: "1M/day" },
  { name: "OpenRouter", note: ":free models — +$10 boosts RPM", tag: "Hybrid" },
];

const STRATEGIES = [
  { n: 1, name: "Priority", body: "First-target ordered list" },
  { n: 2, name: "Fill-First", body: "Fill each target's quota fully" },
  { n: 3, name: "Weighted", body: "Weighted random by per-target weight" },
  { n: 4, name: "Round-Robin", body: "Cycle through targets" },
  { n: 5, name: "P2C", body: "Power-of-two-choices load balancing" },
  { n: 6, name: "Least-Used", body: "Pick the target with lowest load" },
  { n: 7, name: "Random", body: "Uniform random pick" },
  { n: 8, name: "Strict-Random", body: "Random without de-duplication" },
  { n: 9, name: "Cost-Optimized", body: "Minimize $ per request" },
  { n: 10, name: "Headroom", body: "Most remaining quota" },
  { n: 11, name: "Reset-Window", body: "Quota resets soonest" },
  { n: 12, name: "Reset-Aware", body: "Rank by quota reset time" },
  { n: 13, name: "Context-Relay", body: "Hand off context across targets" },
  { n: 14, name: "Context-Optimized", body: "Best fit for context size" },
  { n: 15, name: "Cache-Optimized", body: "Pin reusable prompt prefixes" },
  { n: 16, name: "LKGP", body: "Last-Known-Good Path" },
  { n: 17, name: "Auto", body: "15-factor live scoring" },
  { n: 18, name: "Fusion", body: "Panel + judge synthesizes" },
  { n: 19, name: "Pipeline", body: "Chain steps, output feeds next" },
];

const INTEGRATIONS = [
  "Claude Code", "Codex CLI", "Cline", "Kilo Code", "Zoo Code", "Continue", "Aider", "ForgeCode",
  "jcode", "DeepSeek TUI", "CodeWhale", "OpenCode", "Factory Droid", "GitHub Copilot CLI",
  "Cursor CLI", "Smelt", "Pi", "Grok Build", "Hermes Agent", "OpenClaw", "Goose", "Open Interpreter",
  "Warp AI", "Agent Deck", "Kiro", "Command Code", "Antigravity", "Windsurf", "AMP", "Qwen Code",
  "Gemini CLI", "Copilot Chat", "VS Code", "Zed", "Aider", "Cline",
];

const PLATFORMS = [
  { icon: Package, name: "npm (global)", body: "One command, any OS" },
  { icon: Container, name: "Docker", body: "Multi-arch amd64 + arm64" },
  { icon: MonitorSmartphone, name: "Desktop", body: "Windows / macOS / Linux" },
  { icon: Cpu, name: "ARM", body: "Raspberry Pi, servers, Apple silicon" },
  { icon: Smartphone, name: "Termux", body: "Runs on your phone" },
  { icon: Globe2, name: "PWA", body: "Fullscreen, offline" },
  { icon: Blocks, name: "OpenCode plugin", body: "Native integration" },
  { icon: Package, name: "From source", body: "npm run dev" },
];

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "Founder · Reforge Labs",
    quote: "OmniRoute replaced three proxy scripts and a spreadsheet of API keys. The auto-combos just work — my CI failed over to a free model without me noticing.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Staff Engineer · Northwind",
    quote: "The token compression is not a gimmick. RTK cut our long agent runs by roughly 70%, and code is preserved.",
    stars: 5,
  },
  {
    name: "Kenji Watanabe",
    role: "Indie developer",
    quote: "I set the same endpoint for Claude Code, Cursor and Codex. Zero config, one dashboard for cost, latency and quota.",
    stars: 5,
  },
];

const FAQS = [
  { q: "How do I install OmniRoute?", a: "Run `npm install -g omniroute` then `omniroute run`. Docker, source, PWA, Termux, AUR and Nix options are documented in /docs." },
  { q: "How do I connect a free provider?", a: "Open the dashboard → Providers, find a provider with a Free badge, select Connect and use its free key or keyless mode. OmniRoute pools keys with fair-share quotas." },
  { q: "How do I configure Claude Code?", a: "Set ANTHROPIC_BASE_URL to your OmniRoute endpoint and use an OmniRoute key. Generated configs for 36+ tools are in dashboard → Integrations." },
  { q: "How does compression work?", a: "Six built-in profiles run 12 engines (Lite, Caveman, RTK, LLMLingua-2, OmniGlyph, and more). Estimated savings 15–95% with code, URLs and JSON protected." },
  { q: "Is it safe?", a: "API keys are encrypted with AES-256-GCM, sessions use JWT + httpOnly cookies, guardrails mask secrets and detect prompt injection, and provider keys are never exposed on the public endpoint." },
  { q: "How do I update?", a: "For npm: `npm update -g omniroute`. For Docker: pull the latest multi-arch image. Migrations run automatically on startup." },
  { q: "How do I get support?", a: "Join Discord or Telegram, open a GitHub issue, or read the docs. The community is friendly and actively maintained." },
  { q: "How do I become a contributor?", a: "Read CONTRIBUTING.md, pick a good-first-issue, run `npm run test`, and open a PR. All contributions are welcome under MIT." },
];

function JsonCode() {
  return (
    <div className="mx-auto mt-6 w-full max-w-2xl overflow-hidden rounded-2xl border bg-black/50 text-left shadow-2xl">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">omniroute -- demo</span>
      </div>
      <pre className="p-5 font-mono text-[13px] leading-relaxed text-green-300">
{`$ export ANTHROPIC_BASE_URL=http://localhost:20128/v1
$ export ANTHROPIC_API_KEY=or_sk_live_xxxxxxxx
$ claude
✓ 352 providers   ·   150+ free   ·   19 strategies
→ route: combo=auto/coding · provider=openrouter
→ compression: RTK → Caveman · saved 68%
→ done in 1.2s · $0.000312`}
      </pre>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/20">
              <Route className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">OmniRoute</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link href="/dashboard" className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(124,58,237,0.25),transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_40%_at_80%_20%,rgba(37,99,235,0.18),transparent)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
                <Sparkles className="h-3.5 w-3.5" /> Open source · MIT · Self-hosted or cloud
              </span>
              <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Never stop coding.
                <span className="block bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Every AI tool → 352 providers
                </span>
                — 150+ free — through one endpoint.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                OmniRoute is a universal AI gateway. Give Claude Code, Cursor, Codex and 36+ tools one
                OpenAI-compatible API with automatic routing, 19 strategies, token compression and a live dashboard.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 hover:opacity-90">
                  Install Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl border bg-muted/30 px-6 py-3 text-sm font-semibold hover:bg-muted">
                  <BookOpen className="h-4 w-4" /> Read Docs
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
                <span className="rounded-full border px-3 py-1">✓ ~1.51B Free Tokens / Month</span>
                <span className="rounded-full border px-3 py-1">✓ 352 AI Providers</span>
                <span className="rounded-full border px-3 py-1">✓ 150+ Free Tiers</span>
                <span className="rounded-full border px-3 py-1">✓ 19 Routing Strategies</span>
                <span className="rounded-full border px-3 py-1">✓ 43 Languages</span>
              </div>
            </div>
            <JsonCode />
          </div>
        </section>

        {/* PROMISE */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black sm:text-4xl">The Promise</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Production-grade controls without the production-class headaches.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title} className="group rounded-2xl border p-6 transition-all hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-black sm:text-4xl">Why OmniRoute?</h2>
                <p className="mt-4 max-w-lg text-muted-foreground">
                  We push the open-source gateway further: more providers, more free tiers, more strategies,
                  real compression and a genuinely useful dashboard.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {["352 providers", "150+ free tiers", "19 routing strategies", "12 compression engines", "MCP server · 110 tools", "A2A protocol", "Memory + embeddings", "Guardrails", "Cloud agents", "TLS stealth", "Desktop / Termux / PWA", "43 UI languages"].map((x) => (
                    <div key={x} className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" /> {x}
                    </div>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border bg-background">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-px border-b bg-muted/40 text-xs font-semibold">
                  <div className="px-4 py-3">Feature</div>
                  <div className="bg-violet-500/10 px-4 py-3 text-violet-500">OmniRoute</div>
                  <div className="px-4 py-3 text-muted-foreground">Typical proxies</div>
                </div>
                <div className="divide-y">
                  {COMPARISON.map((row) => (
                    <div key={row.feature} className="grid grid-cols-[1fr_auto_1fr] items-center gap-px bg-muted/40 text-sm">
                      <div className="px-4 py-3">{row.feature}</div>
                      <div className="bg-violet-500/10 px-4 py-3 font-bold text-violet-500">{row.omniroute}</div>
                      <div className="px-4 py-3 text-muted-foreground">{row.others}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREE */}
        <section id="providers" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold text-emerald-500">Free forever</span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Start at $0. Build forever.</h2>
            </div>
            <Link href="/dashboard/providers" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300">
              Explore all providers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FREE.map((p) => (
              <div key={p.name} className="flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{p.name}</h3>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">{p.tag}</span>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.note}</p>
                <Link href="/dashboard/providers" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400">
                  Connect <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* COMBOS */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <span className="text-sm font-semibold text-violet-400">Routing engine</span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">19 Combo strategies</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Choose priority, weighted, round-robin, cost-optimized, auto (15-factor scoring), fusion, pipeline and more.</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {STRATEGIES.map((s) => (
                <div key={s.n} className="group rounded-2xl border p-5 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-bold text-violet-400">{s.n}</span>
                    <h3 className="font-semibold">{s.name}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPRESSION */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-sm font-semibold text-emerald-500">Compression</span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Save 15–95% of your tokens</h2>
              <p className="mt-4 text-muted-foreground">
                12 engines — Session-Dedup, CCR, Lite, RTK, Caveman, Aggressive, LLMLingua-2, Ultra,
                OmniGlyph and more — tuned for shell output, code diffs, tool results and long agent prompts.
              </p>
              <div className="mt-8 space-y-2">
                {[
                  ["Lite", "~15%"],
                  ["Standard / Caveman", "~30%"],
                  ["Aggressive", "~50%"],
                  ["Ultra", "~75%"],
                  ["RTK", "60–90%"],
                  ["Stacked RTK → Caveman", "78–95%"],
                ].map(([name, save]) => (
                  <div key={name} className="flex items-center gap-3 rounded-xl border px-4 py-2.5">
                    <span className="w-44 text-sm font-medium">{name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500" style={{ width: `${Math.min(100, Number(save.replace(/[^0-9]/g, "")))}%` }} />
                    </div>
                    <span className="w-24 text-right text-sm font-semibold text-emerald-500">{save}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-muted/20 p-6">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Before</div>
              <p className="mt-2 text-sm leading-relaxed">
                The reason your React component is re-rendering is likely because you are creating a new
                object reference on each render cycle. When you pass an inline object as a prop, React sees a
                different reference and treats it as a changed value even when the contents are identical.
              </p>
              <div className="my-4 h-px bg-border" />
              <div className="text-xs font-semibold uppercase text-emerald-500">After · Caveman</div>
              <p className="mt-2 font-mono text-sm leading-relaxed">
                New object ref each render. Inline object prop = new ref = re-render. Wrap in useMemo.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Token savings</div>
                  <div className="mt-1 flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-2xl font-black text-emerald-500">~78%</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Cost per 1M requests</div>
                  <div className="mt-1 rounded-xl border p-3 text-2xl font-black">$0</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <span className="text-sm font-semibold text-blue-400">36+ integrations</span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Plug into every AI tool</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">One env var changes. One endpoint. One dashboard for all of them.</p>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {INTEGRATIONS.map((name) => (
                <span key={name} className="rounded-xl border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:border-blue-500/40">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* WHERE */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold text-violet-400">Where it runs</span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Deploy anywhere</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="rounded-2xl border p-5 transition-colors hover:border-violet-500/40">
                <p.icon className="h-6 w-6 text-violet-400" />
                <h3 className="mt-4 font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-black sm:text-4xl">Loved by builders</h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-2xl border bg-background p-6">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">“{t.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">
                      {t.name.split(" ").map((s) => s[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black sm:text-4xl">FAQ</h2>
          </div>
          <details className="group mt-10 rounded-2xl border" open>
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold">
              {FAQS[0].q}
              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-sm text-muted-foreground">{FAQS[0].a}</p>
          </details>
          {FAQS.slice(1).map((f) => (
            <details key={f.q} className="group mt-3 rounded-2xl border">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold">
                {f.q}
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-600/20 via-blue-600/10 to-emerald-600/10 p-10 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
            <h2 className="relative text-3xl font-black sm:text-5xl">Never stop coding.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
              Install OmniRoute in one command and point every AI tool at it today.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:opacity-90">
                <Download className="h-4 w-4" /> npm install -g omniroute
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                <Route className="h-4 w-4" />
              </span>
              <span className="text-lg font-black">OmniRoute</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Universal AI gateway. Every tool → 352 providers through one endpoint.</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5" /> GitHub</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Handshake className="h-3.5 w-3.5" /> Discord</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" /> Telegram</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Product</div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="block hover:text-foreground">Dashboard</Link>
              <Link href="/docs" className="block hover:text-foreground">Documentation</Link>
              <Link href="/pricing" className="block hover:text-foreground">Pricing</Link>
              <Link href="/roadmap" className="block hover:text-foreground">Roadmap</Link>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Community</div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <Link href="/community" className="block hover:text-foreground">Discord / Telegram</Link>
              <Link href="/blog" className="block hover:text-foreground">Blog</Link>
              <Link href="/contributors" className="block hover:text-foreground">Contributors</Link>
              <Link href="/security" className="block hover:text-foreground">Security policy</Link>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Support OmniRoute</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["GitHub Sponsors", "Ko-fi", "Buy Me a Coffee", "Liberapay", "PIX", "BTC/ETH/USDT/USDC"].map((x) => (
                <span key={x} className="rounded-lg border px-2.5 py-1 text-xs text-muted-foreground">{x}</span>
              ))}
            </div>
            <div className="mt-6 rounded-xl border p-3 text-xs text-muted-foreground">MIT License · © 2026 OmniRoute</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// small inline icons used in platforms grid
function Container(props: React.SVGProps<SVGSVGElement>) {
  return <Plug {...props} />;
}
function Cpu(props: React.SVGProps<SVGSVGElement>) {
  return <Cloud {...props} />;
}
function Smartphone(props: React.SVGProps<SVGSVGElement>) {
  return <MonitorSmartphone {...props} />;
}
