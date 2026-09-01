import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

const POSTS = [
  { title: "One endpoint for 352 AI providers", date: "2026-08-20", tag: "Product", excerpt: "How the auto-combo engine picks the best provider for every request." },
  { title: "Saving 95% tokens with RTK", date: "2026-08-10", tag: "Compression", excerpt: "RTK filters shell, test, build and git output before it ever reaches the model." },
  { title: "Running OmniRoute on a Raspberry Pi", date: "2026-07-29", tag: "Self-hosted", excerpt: "ARM multi-arch images make a $35 AI gateway possible." },
  { title: "MCP: 110 tools for your agent", date: "2026-07-14", tag: "MCP", excerpt: "Expose gateway management and routing to any MCP-capable client." },
];

export default function BlogPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">Blog</h1>
        <div className="mt-10 space-y-4">
          {POSTS.map((p) => (
            <Link key={p.title} href="#" className="block rounded-2xl border p-6 transition-colors hover:border-violet-500/40">
              <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-400">{p.tag}</span>{p.date}</div>
              <div className="mt-2 text-lg font-bold">{p.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
