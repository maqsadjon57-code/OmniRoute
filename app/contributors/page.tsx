import { SiteShell } from "@/components/site-shell";

const NAMES = ["A. Rivera", "P. Nair", "K. Watanabe", "S. Ali", "M. Chen", "T. Okafor", "S. Petrov", "L. Garcia", "H. Suzuki", "D. Müller", "A. Costa", "J. Kim"];

export default function ContributorsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">Contributors</h1>
        <p className="mt-3 text-muted-foreground">550+ people helped make OmniRoute.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {NAMES.map((n) => (
            <div key={n} className="flex items-center gap-3 rounded-2xl border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">{n.split(" ").map((s) => s[0]).join("")}</div>
              <span className="text-sm font-medium">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
