import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Code2, MessageSquare, Phone, Wifi } from "lucide-react";

const CHANNELS = [
  { name: "GitHub Discussions", desc: "Issues, ideas and features", href: "https://github.com/maqsadjon57-code/OmniRoute", icon: Code2 },
  { name: "Discord", desc: "Real-time help", href: "#", icon: MessageSquare },
  { name: "Telegram", desc: "Announcements", href: "#", icon: Wifi },
  { name: "LinkedIn", desc: "Professional updates", href: "#", icon: Phone },
];

export default function CommunityPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">Community</h1>
        <p className="mt-3 text-muted-foreground">Build alongside 550+ contributors and thousands of users.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((c) => (
            <Link key={c.name} href={c.href} className="rounded-2xl border p-6 transition-colors hover:border-violet-500/40">
              <c.icon className="h-6 w-6 text-violet-400" />
              <div className="mt-4 font-bold">{c.name}</div>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
