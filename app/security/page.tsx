import { SiteShell } from "@/components/site-shell";
import { Shield, Lock, Eye } from "lucide-react";

export default function SecurityPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">Security</h1>
        <p className="mt-3 text-muted-foreground">OmniRoute takes security seriously. Report vulnerabilities privately — never in a public issue.</p>
        <div className="mt-10 space-y-4">
          {[
            { icon: Lock, title: "AES-256-GCM at rest", body: "Provider API keys and OAuth tokens are encrypted with a master key from the environment." },
            { icon: Shield, title: "Guardrails", body: "Prompt-injection detection, secret masking, HTML sanitisation, rate limiting and Helmet-style headers." },
            { icon: Eye, title: "Responsible disclosure", body: "Email security@omniroute.dev. We acknowledge within 72 hours and credit valid reports." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border p-6">
              <s.icon className="h-6 w-6 text-violet-400" />
              <div className="mt-3 font-bold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
