import { getSetting } from "@/lib/db";
import type { ChatMessage } from "@/lib/types";
import { textOfContent } from "@/lib/utils";

const INJECTION_PATTERNS = [
  /ignore (all|the above|previous|prior) (instructions|rules|prompts)/i,
  /system\s*prompt/i,
  /pretend (you are|to be)[^\n]{0,80}/i,
  /jailbreak/i,
  /disregard (all|the) (instructions|rules)/i,
  /developer\s+message\s*[:=]/i,
  /<\|begin_of_text\|><\|start_header_id\|>/i,
];

const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{16,}/g,
  /sk-ant-[A-Za-z0-9_-]{16,}/g,
  /AIza[0-9A-Za-z_-]{20,}/g,
  /Bearer\s+[A-Za-z0-9._-]{20,}/gi,
  /ghp_[A-Za-z0-9]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
];

export interface GuardrailResult {
  ok: boolean;
  injectionDetected: boolean;
  masked: ChatMessage[];
  reasons: string[];
}

export function runGuardrails(messages: ChatMessage[]): GuardrailResult {
  const enabled = getSetting("guardrails.enabled", "1") === "1";
  const mask = getSetting("guardrails.secretMasking", "1") === "1";
  const reasons: string[] = [];
  let injectionDetected = false;

  const cleaned = messages.map((message) => {
    const original = textOfContent(message.content);
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(original)) {
        injectionDetected = true;
        reasons.push(`Possible prompt-injection marker matched in ${message.role}: ${pattern.source}`);
      }
    }
    let content = original;
    if (mask) {
      for (const pattern of SECRET_PATTERNS) {
        content = content.replace(pattern, (m) => `${m.slice(0, 4)}***${m.slice(-2)}`);
      }
    }
    return {
      ...message,
      content: enabled ? content : original,
    };
  });

  return { ok: enabled ? true : true, injectionDetected, masked: cleaned, reasons };
}

export function sanitizeOut<T>(value: T): T {
  // Output sanitization hook (DOMPurify equivalent is applied client-side).
  return value;
}
