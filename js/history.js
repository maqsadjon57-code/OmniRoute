/* Command / conversation history */

import { storageGet, storageSet } from "./utils.js";
import { Settings } from "./settings.js";

const KEY = "ccweb.history.v1";
const CONV_KEY = "ccweb.conversation.v1";

export const History = {
  items: storageGet(KEY, []) || [],
  index: -1,
  draft: "",

  push(cmd) {
    cmd = String(cmd).trim();
    if (!cmd) return;
    if (this.items[this.items.length - 1] === cmd) {
      this.index = this.items.length;
      return;
    }
    this.items.push(cmd);
    const max = Settings.get("history_size") || 1000;
    if (this.items.length > max) this.items = this.items.slice(-max);
    storageSet(KEY, this.items);
    this.index = this.items.length;
  },

  prev(current) {
    if (this.index === this.items.length) this.draft = current || "";
    if (!this.items.length) return current;
    this.index = Math.max(0, this.index - 1);
    return this.items[this.index];
  },

  next() {
    if (!this.items.length) return this.draft;
    this.index = Math.min(this.items.length, this.index + 1);
    if (this.index >= this.items.length) return this.draft;
    return this.items[this.index];
  },

  search(q) {
    q = String(q || "").toLowerCase();
    if (!q) return [...this.items].reverse();
    return this.items.filter((x) => x.toLowerCase().includes(q)).reverse();
  },

  lastMatch(q) {
    const hits = this.search(q);
    return hits[0] || "";
  },

  clear() {
    this.items = [];
    this.index = -1;
    storageSet(KEY, []);
  },

  list(n = 50) {
    return this.items.slice(-n);
  },
};

export const Conversation = {
  messages: storageGet(CONV_KEY, []) || [],

  add(msg) {
    this.messages.push({ ...msg, ts: msg.ts || Date.now() });
    this.persist();
  },

  persist() {
    const slim = this.messages.slice(-400);
    storageSet(CONV_KEY, slim);
  },

  clear() {
    this.messages = [];
    storageSet(CONV_KEY, []);
  },

  exportJSON() {
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), messages: this.messages }, null, 2);
  },

  exportMarkdown() {
    return this.messages.map((m) => {
      const who = m.role === "user" ? "You" : m.role === "assistant" ? "Claude" : "System";
      return `### ${who}\n\n${m.text || ""}\n`;
    }).join("\n");
  },

  importJSON(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(data.messages)) {
      this.messages = data.messages;
      this.persist();
      return this.messages.length;
    }
    throw new Error("Invalid conversation file");
  },
};

export default History;
