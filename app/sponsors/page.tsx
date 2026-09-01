import { SiteShell } from "@/components/site-shell";
import { Heart } from "lucide-react";

export default function SponsorsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="flex items-center gap-3 text-4xl font-black"><Heart className="h-8 w-8 text-violet-400" />Sponsors</h1>
        <p className="mt-3 text-muted-foreground">OmniRoute is funded by the community. Support via GitHub Sponsors, Ko-fi, Buy Me a Coffee, Liberapay, PIX or crypto.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {["GitHub Sponsors", "Ko-fi", "Buy Me a Coffee", "Liberapay"].map((s) => (
            <div key={s} className="rounded-2xl border p-6 text-center">
              <div className="font-bold">{s}</div>
              <div className="mt-1 text-sm text-muted-foreground">Support maintenance and servers</div>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
