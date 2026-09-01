"use client";

import { useState } from "react";
import { Copy, Check, TerminalSquare, Settings2 } from "lucide-react";

interface Integration {
  name: string;
  type: string;
  env: Record<string, string>;
}

const INTEGRATIONS: Integration[] = [
  { name: "Claude Code", type: "ANTHROPIC", env: { ANTHROPIC_BASE_URL: "http://localhost:20128/v1", ANTHROPIC_API_KEY: "or_sk_live_..." } },
  { name: "Codex CLI", type: "OpenAI", env: { OPENAI_BASE_URL: "http://localhost:20128/v1", OPENAI_API_KEY: "or_sk_live_..." } },
  { name: "Cursor", type: "OpenAI", env: { OPENAI_BASE_URL: "http://localhost:20128/v1", OPENAI_API_KEY: "or_sk_live_..." } },
  { name: "Cline", type: "OpenAI", env: { "OPENAI_API_BASE_URL": "http://localhost:20128/v1", "OPENAI_API_KEY": "or_sk_live_..." } },
  { name: "Aider", type: "OpenAI", env: { OPENAI_API_BASE: "http://localhost:20128/v1", OPENAI_API_KEY: "or_sk_live_..." } },
  { name: "Copilot CLI", type: "OpenAI", env: { COPILOT_BASE_URL: "http://localhost:20128/v1", COPILOT_API_KEY: "or_sk_live_..." } },
  { name: "Goose", type: "OpenAI", env: { GOOSE_BASE_URL: "http://localhost:20128/v1", GOOSE_API_KEY: "or_sk_live_..." } },
  { name: "Gemini CLI", type: "OpenAI", env: { GOOGLE_GEMINI_BASE_URL: "http://localhost:20128/v1", GOOGLE_GEMINI_API_KEY: "or_sk_live_..." } },
  { name: "Qwen Code", type: "OpenAI", env: { DASHSCOPE_API_BASE: "http://localhost:20128/v1", DASHSCOPE_API_KEY: "or_sk_live_..." } },
  { name: "Open Interpreter", type: "OpenAI", env: { OPENAI_API_BASE: "http://localhost:20128/v1", OPENAI_API_KEY: "or_sk_live_..." } },
  { name: "Warp AI", type: "OpenAI", env: { WARP_BASE_URL: "http://localhost:20128/v1", WARP_API_KEY: "or_sk_live_..." } },
  { name: "Windsurf", type: "OpenAI", env: { WINDSURF_API_BASE: "http://localhost:20128/v1", WINDSURF_API_KEY: "or_sk_live_..." } },
];

export default function IntegrationsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(name: string, env: Record<string, string>) {
    const text = Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Integrations</h1>
        <p className="text-sm text-muted-foreground">One endpoint · 36+ tools · copy a config and go.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <div key={i.name} className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><TerminalSquare className="h-5 w-5" /></span>
                <div>
                  <div className="font-bold">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.type}</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">ready</span>
            </div>
            <div className="mt-4 rounded-xl bg-black/50 p-3 font-mono text-[11px] text-emerald-300">
              <div className="mb-1 text-[10px] uppercase text-muted-foreground">Environment</div>
              {Object.entries(i.env).map(([k, v]) => <div key={k} className="break-all"><span className="text-muted-foreground">{k}</span> = {v}</div>)}
            </div>
            <button onClick={() => copy(i.name, i.env)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm hover:bg-muted">
              {copied === i.name ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied === i.name ? "Copied" : "Copy config"}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5">
        <h2 className="flex items-center gap-2 font-bold"><Settings2 className="h-4 w-4 text-violet-400" /> OmniRoute CLI</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["omniroute run", "Start the gateway"],
            ["omniroute configure", "Interactive setup"],
            ["omniroute connect", "Remote mode"],
            ["omniroute models list", "Show available models"],
            ["omniroute providers list", "Show providers"],
            ["omniroute combo list", "Show combos"],
            ["omniroute health", "System health"],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div>
                <div className="font-mono text-sm">{cmd}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
