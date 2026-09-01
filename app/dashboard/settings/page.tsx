"use client";

import { useEffect, useState } from "react";
import { Check, Save, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-script";
import { cn } from "@/lib/utils";

const LANGS = ["en", "ru", "es", "fr", "de", "pt", "zh", "ja", "ko", "hi", "ar", "he", "uk", "tr", "it", "nl", "pl", "sv", "da", "fi", "no", "cs", "el", "ro", "hu", "bg", "hr", "sk", "sl", "et", "lv", "lt", "id", "ms", "th", "vi", "fa", "ur", "bn", "sw", "af", "ca", "eu"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [port, setPort] = useState(20128);
  const [saved, setSaved] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function save() {
    setSaved(false);
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "app.theme": document.documentElement.classList.contains("dark") ? "dark" : "light",
        "app.language": settings["app.language"] ?? "en",
        "app.mode": settings["app.mode"] ?? "local",
        "guardrails.enabled": settings["guardrails.enabled"] ?? "1",
        "guardrails.secretMasking": settings["guardrails.secretMasking"] ?? "1",
        "compression.activeProfile": settings["compression.activeProfile"] ?? "standard",
        "monitor.retentionDays": settings["monitor.retentionDays"] ?? "90",
      }),
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Settings</h1>
          <p className="text-sm text-muted-foreground">Runtime, language, security and monitoring.</p>
        </div>
        <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <h2 className="font-bold">General</h2>
          <div className="mt-4 space-y-4">
            <Field label="Port">
              <input value={port} onChange={(e) => setPort(Number(e.target.value))} type="number" className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none" />
            </Field>
            <Field label="Mode">
              <select value={settings["app.mode"] ?? "local"} onChange={(e) => setSettings({ ...settings, "app.mode": e.target.value })} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
                <option value="local">Local (self-hosted)</option>
                <option value="remote">Remote / cloud</option>
              </select>
            </Field>
            <Field label="Language">
              <select value={settings["app.language"] ?? "en"} onChange={(e) => setSettings({ ...settings, "app.language": e.target.value })} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
                {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Theme">
              <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                <span>{isDark ? "Dark" : "Light"}</span>
                <ThemeToggle />
              </div>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <h2 className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-violet-400" /> Security</h2>
          <div className="mt-4 space-y-3">
            <Toggle label="Guardrails" value={settings["guardrails.enabled"] ?? "1"} onToggle={() => setSettings({ ...settings, "guardrails.enabled": settings["guardrails.enabled"] === "1" ? "0" : "1" })} />
            <Toggle label="Secret masking" value={settings["guardrails.secretMasking"] ?? "1"} onToggle={() => setSettings({ ...settings, "guardrails.secretMasking": settings["guardrails.secretMasking"] === "1" ? "0" : "1" })} />
            <Toggle label="AES-256-GCM encryption" value="1" />
            <Toggle label="TLS fingerprint spoofing" value="0" />
            <div className="rounded-xl border bg-emerald-500/5 p-3 text-xs text-emerald-500">Provider API keys are encrypted at rest and never exposed to public endpoints.</div>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <h2 className="font-bold">Compression & monitoring</h2>
          <div className="mt-4 space-y-4">
            <Field label="Active profile">
              <select value={settings["compression.activeProfile"] ?? "standard"} onChange={(e) => setSettings({ ...settings, "compression.activeProfile": e.target.value })} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
                <option value="lite">Lite</option>
                <option value="standard">Standard / Caveman</option>
                <option value="aggressive">Aggressive</option>
                <option value="ultra">Ultra</option>
                <option value="rtk">RTK</option>
                <option value="stacked">Stacked</option>
              </select>
            </Field>
            <Field label="Retention (days)">
              <input value={settings["monitor.retentionDays"] ?? "90"} onChange={(e) => setSettings({ ...settings, "monitor.retentionDays": e.target.value })} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none" />
            </Field>
            <Toggle label="Prometheus export" value="0" />
            <Toggle label="WebSocket live updates" value="1" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Toggle({ label, value, onToggle }: { label: string; value: string; onToggle?: () => void }) {
  const on = value === "1";
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <button onClick={onToggle} className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-violet-600" : "bg-muted")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
