import { getSetting } from "@/lib/db";
import { estimateTokens } from "@/lib/utils";
import type { ChatMessage, CompressionEngine } from "@/lib/types";
import { COMPRESSION_ENGINES } from "@/lib/types";

export interface CompressionProfile {
  id: string;
  name: string;
  description: string;
  expectedSavings: string;
  engines: CompressionEngine[];
}

export const COMPRESSION_PROFILES: CompressionProfile[] = [
  {
    id: "lite",
    name: "Lite",
    description: "Safe default: whitespace, URL trimming, dedup",
    expectedSavings: "~15%",
    engines: ["session-dedup", "lite"],
  },
  {
    id: "standard",
    name: "Standard / Caveman",
    description: "Daily coding sessions",
    expectedSavings: "~30%",
    engines: ["session-dedup", "lite", "caveman"],
  },
  {
    id: "aggressive",
    name: "Aggressive",
    description: "Long sessions, aggressive pruning",
    expectedSavings: "~50%",
    engines: ["session-dedup", "lite", "relevance", "caveman", "aggressive"],
  },
  {
    id: "ultra",
    name: "Ultra",
    description: "Maximum savings for huge context",
    expectedSavings: "~75%",
    engines: ["session-dedup", "ccr", "relevance", "caveman", "aggressive", "ultra"],
  },
  {
    id: "rtk",
    name: "RTK",
    description: "Shell / test / build / git output",
    expectedSavings: "60-90%",
    engines: ["rtk", "responses-tool-output", "headroom"],
  },
  {
    id: "stacked",
    name: "Stacked (RTK → Caveman)",
    description: "Maximum stacked savings",
    expectedSavings: "78-95%",
    engines: ["rtk", "responses-tool-output", "headroom", "caveman"],
  },
];

export interface EngineStats {
  engine: CompressionEngine;
  before: number;
  after: number;
}

export interface CompressionResult {
  messages: ChatMessage[];
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savedPercent: number;
  engines: EngineStats[];
  profileId: string;
}

export function activeProfile(): string {
  return (
    getSetting("compression.activeProfile", "standard") ||
    (getSetting("compression.enabled", "1") === "1" ? "standard" : "lite")
  );
}

export function getProfile(id: string): CompressionProfile {
  return COMPRESSION_PROFILES.find((p) => p.id === id) ?? COMPRESSION_PROFILES[1];
}

function compressText(text: string, engine: CompressionEngine): string {
  switch (engine) {
    case "session-dedup": {
      const lines = text.split("\n");
      const seen = new Set<string>();
      return lines
        .filter((line) => {
          const key = line.trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .join("\n");
    }
    case "ccr": {
      // Compact large repeated blocks into a marker.
      const blocks = text.match(/([A-Za-z0-9 /;:,.?_-]{4,})(?:\n\1)+/g);
      let out = text;
      for (const block of blocks ?? []) {
        out = out.replace(block, `[block x${block.length / block.indexOf("\n")} compressed]`);
      }
      return out;
    }
    case "lite": {
      return text
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/https?:\/\/[^\s]{80,}/g, (m) => `${m.slice(0, 40)}…`)
        .trim();
    }
    case "rtk": {
      // Tool output focused: trim ANSI, collapse long repeated output, drop trace noise.
      const ansi = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
      return text
        .replace(ansi, "")
        .replace(/at\s+[^\n]+\.(?:js|ts|tsx):\d+:\d+/g, "[stack]")
        .replace(/^\s*$(\n\s*)+/gm, "")
        .split("\n")
        .slice(0, 160)
        .join("\n");
    }
    case "responses-tool-output": {
      return text.replace(/"(?:analysis|message|summary)"\s*:\s*"[^"]{60,}"/g, '"$1":"[redacted]"');
    }
    case "headroom": {
      const rows: string[] = [];
      for (const line of text.split("\n")) {
        const cols = line.split(/\s{2,}|\t/);
        if (cols.length > 3 && line.length > 120) {
          rows.push(`${cols[0]} … ${cols[cols.length - 1]}`);
        } else {
          rows.push(line);
        }
      }
      return rows.join("\n");
    }
    case "relevance": {
      const lines = text.split("\n");
      if (lines.length <= 12) return text;
      return [...lines.slice(0, 4), `… [${lines.length} lines compressed] …`, ...lines.slice(-4)].join("\n");
    }
    case "caveman": {
      // Rule-based terse rewrite for natural language.
      return text
        .replace(/\bthe reason (?:why)?\b/gi, "why")
        .replace(/\b(?:it is|this is|that is)\b/gi, "=")
        .replace(/\byou are\b/gi, "you're")
        .replace(/\bis likely because\b/gi, "because")
        .replace(/\b(?:likely|probably)\b/gi, "likely")
        .replace(/\b(?:creating a|making a)\b/gi, "make")
        .replace(/\bon each render cycle\b/gi, "on render")
        .replace(/\.\s+/g, ". ")
        .replace(/,\s+/g, ", ");
    }
    case "aggressive": {
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length <= 6) return text;
      return [
        ...sentences.slice(0, 3),
        `…[${sentences.length - 6} sentences summarized]…`,
        ...sentences.slice(-3),
      ].join(" ");
    }
    case "llmlingua-2": {
      // Heuristic stand-in for an ONNX MobileBERT pass: drop filler.
      return text
        .replace(/\b(?:basically|actually|honestly|just|really|very|simply)\b/gi, " ")
        .replace(/[ ]{2,}/g, " ");
    }
    case "ultra": {
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length <= 8) return text;
      const keep = [
        sentences[0],
        sentences.slice(Math.floor(sentences.length / 2), Math.floor(sentences.length / 2) + 2).join(" "),
        sentences[sentences.length - 1],
      ].join(" ");
      return keep.replace(/\b(?:the|a|an|of|to|and)\b/gi, (m) => (Math.random() > 0.3 ? m : ""));
    }
    case "omni-glyph": {
      // Experimental: keep headers + first sentence (visual "glyph" representation).
      const lines = text.split("\n");
      if (lines.length <= 8) return text;
      return lines.filter((l) => /^#{1,3}\s|^[-*]\s/.test(l) || l.length < 80).slice(0, 12).join("\n");
    }
    default:
      return text;
  }
}

export function compressMessages(
  messages: ChatMessage[],
  profileId?: string,
  enabledOverride?: boolean,
): CompressionResult {
  const enabled = enabledOverride ?? getSetting("compression.enabled", "1") === "1";
  const profile = getProfile(profileId ?? activeProfile());
  const originalTokens = messages.reduce((sum, m) => sum + estimateTokens(JSON.stringify(m.content)), 0);
  const engines: EngineStats[] = [];
  let working = messages;

  if (enabled) {
    for (const engine of profile.engines) {
      const before = working.reduce((sum, m) => sum + estimateTokens(JSON.stringify(m.content)), 0);
      working = working.map((m) => {
        const text = textOfContentValue(m.content);
        return { ...m, content: compressText(text, engine) };
      });
      const after = working.reduce((sum, m) => sum + estimateTokens(JSON.stringify(m.content)), 0);
      engines.push({ engine, before, after });
    }
  }

  const compressedTokens = working.reduce((sum, m) => sum + estimateTokens(JSON.stringify(m.content)), 0);
  const savedTokens = Math.max(0, originalTokens - compressedTokens);
  const savedPercent = originalTokens > 0 ? (savedTokens / originalTokens) * 100 : 0;

  return {
    messages: working,
    originalTokens,
    compressedTokens,
    savedTokens,
    savedPercent,
    engines,
    profileId: profile.id,
  };
}

function textOfContentValue(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => (typeof p === "string" ? p : typeof p === "object" && p && "text" in p ? String((p as { text: unknown }).text ?? "") : "")).join("\n");
  }
  return String(content ?? "");
}

export const ALL_COMPRESSION_ENGINES = COMPRESSION_ENGINES;
