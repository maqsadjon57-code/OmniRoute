"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Blocks, Boxes, Cpu, KeyRound, LayoutDashboard, Plug,
  Settings, Shrink, TerminalSquare, User, Webhook,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-script";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/providers", label: "Providers", icon: Plug },
  { href: "/dashboard/combos", label: "Combos", icon: Boxes },
  { href: "/dashboard/keys", label: "Keys & Security", icon: KeyRound },
  { href: "/dashboard/compression", label: "Compression", icon: Shrink },
  { href: "/dashboard/analytics", label: "Analytics", icon: Activity },
  { href: "/dashboard/integrations", label: "Integrations", icon: TerminalSquare },
  { href: "/dashboard/mcp", label: "MCP & A2A", icon: Blocks },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
          <Cpu className="h-5 w-5" />
        </span>
        <span className="text-lg font-black">OmniRoute</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-violet-500/10 text-violet-400" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Local mode</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <ThemeToggle className="w-full justify-start px-3" />
      </div>
    </aside>
  );
}
