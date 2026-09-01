import Link from "next/link";
import { Route } from "lucide-react";
import { ThemeToggle } from "@/components/theme-script";

const NAV = [
  { label: "Features", href: "/#features" },
  { label: "Providers", href: "/#providers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Community", href: "/community" },
  { label: "Blog", href: "/blog" },
];

export function SiteShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
              <Route className="h-5 w-5" />
            </span>
            <span className="text-lg font-black">{title ?? "OmniRoute"}</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard" className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Open Dashboard</Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <span>MIT License · © 2026 OmniRoute</span>
          <div className="flex gap-4">
            <Link href="/security" className="hover:text-foreground">Security</Link>
            <Link href="/roadmap" className="hover:text-foreground">Roadmap</Link>
            <Link href="/contributors" className="hover:text-foreground">Contributors</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
