"use client";

import { useEffect, useState } from "react";
import { Check, FlaskConical, Gauge, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  description: string;
  expectedSavings: string;
  engines: string[];
}

interface TestResult {
  original: string;
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savedPercent: number;
  engines: { engine: string; before: number; after: number }[];
}

const SAMPLE = `The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. When you pass an inline object as a prop, React sees a different reference and treats it as a changed value even when the contents are identical. The practical fix is to move the object outside the component or wrap it in useMemo. Another common cause is passing a new array literal directly in the JSX, which also creates a new reference every time the parent renders. Sometimes you can also stabilize the value by using a constant at module scope, or by moving the computation into a child component that is memoized with React.memo.`;

export default function CompressionPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState("standard");
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState<TestResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/compression/test")
      .then((r) => r.json())
      .then((d) => setProfiles(d.profiles ?? []));
  }, []);

  function run() {
    setBusy(true);
    fetch("/api/compression/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, profile }),
    })
      .then((r) => r.json())
      .then(setResult)
      .finally(() => setBusy(false));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Compression</h1>
          <p className="text-sm text-muted-foreground">12 engines · 6 profiles · 15–95% token savings</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="font-semibold">Engine</span>
          <span className="text-muted-foreground">RTK → Caveman</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Test bench</h2>
              <button onClick={run} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                <FlaskConical className="h-4 w-4" /> {busy ? "Running..." : "Compress"}
              </button>
            </div>
            <label className="text-xs font-semibold">Input</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="mt-1 w-full rounded-xl border bg-background p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-violet-500/30" />
            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-xs font-semibold">Profile</label>
                <select value={profile} onChange={(e) => setProfile(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
                  {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold">Result</h2>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-500">
                  {result.savedPercent.toFixed(0)}% saved · {result.savedTokens} tokens
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-sm leading-relaxed text-emerald-100">
                {result.compressed}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Metric label="Original" value={`${result.originalTokens}`} />
                <Metric label="Compressed" value={`${result.compressedTokens}`} />
                <Metric label="Saved" value={`${result.savedTokens}`} />
              </div>
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Engines used</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.engines.map((e) => (
                    <span key={e.engine} className="rounded-lg border px-2.5 py-1 text-xs">{e.engine} <span className="text-muted-foreground">· {e.before}→{e.after}</span></span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border p-5">
            <h2 className="font-bold">Profiles</h2>
            <div className="mt-4 space-y-2">
              {profiles.map((p) => (
                <button key={p.id} onClick={() => setProfile(p.id)} className={cn("w-full rounded-xl border p-3 text-left transition-colors", profile === p.id ? "border-violet-500/40 bg-violet-500/5" : "hover:bg-muted")}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-emerald-500">{p.expectedSavings}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.engines.slice(0, 3).map((e) => <span key={e} className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px]">{e}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="font-bold">Engine order</h2>
            <div className="mt-4 space-y-1.5 text-sm">
              {["Session-Dedup", "Lite", "Caveman", "RTK", "LLMLingua-2", "Ultra", "OmniGlyph"].map((e, i) => (
                <div key={e} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-xs font-bold text-violet-400">{i + 1}</span>
                  <span className="flex-1">{e}</span>
                  {i < 2 && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="flex items-center gap-2 font-bold"><Gauge className="h-4 w-4 text-violet-400" /> Context budget</h2>
            <p className="mt-2 text-xs text-muted-foreground">Reserves output space dynamically and protects code, URLs and JSON from destructive pruning.</p>
            <div className="mt-3 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">Adaptive budget · on</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}
