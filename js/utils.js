/* Shared helpers + event bus */

export const bus = {
  _h: Object.create(null),
  on(ev, fn) {
    (this._h[ev] ||= []).push(fn);
    return () => this.off(ev, fn);
  },
  off(ev, fn) {
    this._h[ev] = (this._h[ev] || []).filter((f) => f !== fn);
  },
  emit(ev, ...args) {
    (this._h[ev] || []).slice().forEach((f) => {
      try { f(...args); } catch (e) { console.error(`[bus:${ev}]`, e); }
    });
  },
};

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function unescapeHtml(s) {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function now() {
  return Date.now();
}

export function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

export function fmtTime(ts = Date.now()) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fmtDate(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${fmtTime(ts)}`;
}

export function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function debounce(fn, ms = 150) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export function throttle(fn, ms = 100) {
  let last = 0, t;
  return (...a) => {
    const n = Date.now();
    if (n - last >= ms) {
      last = n;
      fn(...a);
    } else {
      clearTimeout(t);
      t = setTimeout(() => {
        last = Date.now();
        fn(...a);
      }, ms - (n - last));
    }
  };
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function download(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = el("textarea", { style: { position: "fixed", left: "-9999px" } });
  ta.value = text;
  document.body.append(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
  return Promise.resolve();
}

export function fuzzyScore(query, text) {
  query = query.toLowerCase();
  text = text.toLowerCase();
  if (!query) return 1;
  if (text === query) return 100;
  if (text.startsWith(query)) return 80;
  if (text.includes(query)) return 50;
  let ti = 0, score = 0;
  for (let i = 0; i < query.length; i++) {
    const idx = text.indexOf(query[i], ti);
    if (idx < 0) return 0;
    score += 2 - Math.min(1, idx - ti);
    ti = idx + 1;
  }
  return score;
}

export function extOf(path) {
  const m = String(path).match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

export function basename(path) {
  const p = String(path).replace(/\\/g, "/");
  const i = p.lastIndexOf("/");
  return i >= 0 ? p.slice(i + 1) : p;
}

export function dirname(path) {
  const p = String(path).replace(/\\/g, "/");
  const i = p.lastIndexOf("/");
  if (i <= 0) return "/";
  return p.slice(0, i);
}

export function joinPath(...parts) {
  const segs = [];
  for (const p of parts) {
    if (!p) continue;
    for (const s of String(p).replace(/\\/g, "/").split("/")) {
      if (!s || s === ".") continue;
      if (s === "..") segs.pop();
      else segs.push(s);
    }
  }
  return "/" + segs.join("/");
}

export function langFromExt(ext) {
  const map = {
    js: "javascript", mjs: "javascript", cjs: "javascript", jsx: "javascript",
    ts: "typescript", tsx: "typescript",
    py: "python", pyw: "python",
    html: "html", htm: "html",
    css: "css", scss: "css",
    json: "json",
    md: "markdown", markdown: "markdown",
    sh: "bash", bash: "bash", zsh: "bash",
    go: "go", rs: "rust", rb: "ruby", php: "php",
    yml: "yaml", yaml: "yaml", toml: "toml",
    xml: "xml", svg: "xml",
    c: "c", h: "c", cpp: "cpp", hpp: "cpp",
    java: "java", kt: "kotlin", swift: "swift",
    sql: "sql", dockerfile: "docker",
  };
  return map[ext] || ext || "text";
}

export function iconFor(path, isDir = false) {
  if (isDir) return "📁";
  const ext = extOf(path);
  const map = {
    js: "📜", ts: "💠", py: "🐍", html: "🌐", css: "🎨", json: "🧾",
    md: "📝", sh: "💻", go: "🐹", rs: "🦀", rb: "💎", yml: "⚙️",
    yaml: "⚙️", svg: "🖼️", png: "🖼️", jpg: "🖼️", gif: "🖼️",
    gitignore: "🙈", lock: "🔒", txt: "📄", env: "🔐",
  };
  if (basename(path).startsWith(".")) return "•";
  return map[ext] || "📄";
}

export function isDangerous(cmd) {
  const c = String(cmd).trim();
  return /rm\s+-rf|rm\s+-fr|mkfs|dd\s+if=|:(){:|fork\s*\(|shutdown|reboot|drop\s+table|format\s+[a-z]:/i.test(c);
}

export function parseArgs(str) {
  const out = [];
  let cur = "", q = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (q) {
      if (ch === q) q = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") q = ch;
    else if (/\s/.test(ch)) {
      if (cur) { out.push(cur); cur = ""; }
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

export function storageGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

export function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

export const BRAILLE = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export const THINKING_PHRASES = [
  "Thinking",
  "Brewing",
  "Crafting",
  "Pondering",
  "Working",
  "Reasoning",
  "Composing",
  "Inspecting",
  "Synthesizing",
  "Figuring it out",
];

export function randomPhrase() {
  return THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];
}

export function countLines(text) {
  if (!text) return 0;
  return String(text).split("\n").length;
}

export function indent(text, n = 2) {
  const pad = " ".repeat(n);
  return String(text).split("\n").map((l) => pad + l).join("\n");
}

export function truncate(s, n = 80) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
