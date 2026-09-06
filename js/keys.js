/* Anthropic API key — stored only in this browser */

import { bus } from "./utils.js";

const KEY = "ccweb.anthropic.apikey";
const BASE_KEY = "ccweb.anthropic.base";

export const Keys = {
  get() {
    try { return localStorage.getItem(KEY) || ""; }
    catch { return ""; }
  },
  set(value) {
    const v = String(value || "").trim();
    try {
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    } catch { /* quota */ }
    bus.emit("keys:change", this.has());
  },
  clear() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    bus.emit("keys:change", false);
  },
  has() {
    return this.get().length >= 12;
  },
  masked() {
    const k = this.get();
    if (!k) return "";
    if (k.length < 12) return "••••";
    return k.slice(0, 8) + "…" + k.slice(-4);
  },
  base() {
    try { return localStorage.getItem(BASE_KEY) || "https://api.anthropic.com"; }
    catch { return "https://api.anthropic.com"; }
  },
  setBase(url) {
    const v = String(url || "").trim().replace(/\/$/, "") || "https://api.anthropic.com";
    try { localStorage.setItem(BASE_KEY, v); } catch { /* ignore */ }
    bus.emit("keys:change", this.has());
  },
};

export default Keys;
