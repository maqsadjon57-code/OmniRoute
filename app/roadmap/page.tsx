import { SiteShell } from "@/components/site-shell";

const ITEMS = [
  { area: "Routing", done: 60, items: "19 strategies live; fusion/pipeline in beta" },
  { area: "Compression", done: 45, items: "6 profiles live; LLMLingua-2 ONNX in progress" },
  { area: "MCP", done: 25, items: "Transport stubs live; 110 tools in progress" },
  { area: "Integrations", done: 55, items: "36+ configs; Electron desktop in progress" },
  { area: "Cloud", done: 15, items: "Postgres + Redis scales available in beta" },
];

export default function RoadmapPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-black">Roadmap</h1>
        <div className="mt-10 space-y-4">
          {ITEMS.map((i) => (
            <div key={i.area} className="rounded-2xl border p-5">
              <div className="flex items-center justify-between">
                <div className="font-bold">{i.area}</div>
                <div className="text-xs text-muted-foreground">{i.done}%</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${i.done}%` }} /></div>
              <p className="mt-3 text-sm text-muted-foreground">{i.items}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
