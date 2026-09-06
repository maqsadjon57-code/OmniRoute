/* Bottom status bar */

import { $, fmtTime } from "./utils.js";
import { fs } from "./files.js";

let state = {
  status: "Ready",
  kind: "ready",
  tools: 12,
  saved: true,
  online: navigator.onLine,
  encoding: "UTF-8",
  started: Date.now(),
  row: 1,
  col: 1,
};

function setText(id, text) {
  const n = document.getElementById(id);
  if (n) n.textContent = text;
}

export const StatusBar = {
  get() { return { ...state }; },

  setStatus(label, kind = "ready") {
    state.status = label;
    state.kind = kind;
    const el = document.getElementById("sb-status");
    if (!el) return;
    el.querySelector(".label").textContent = label;
    el.classList.remove("status-busy", "status-error", "status-thinking", "status-offline");
    if (kind !== "ready") el.classList.add("status-" + kind);
  },

  setSaved(v) {
    state.saved = v;
    setText("sb-saved", v ? "Saved" : "Unsaved");
  },

  setCwd(p) {
    setText("sb-cwd", p || fs.cwd);
  },

  setTools(n) {
    state.tools = n;
    setText("sb-tools", `${n} tools`);
  },

  setCursor(row, col) {
    state.row = row; state.col = col;
    setText("sb-cursor", `${row}:${col}`);
  },

  setOnline(v) {
    state.online = v;
    setText("sb-net", v ? "Online" : "Offline");
  },

  tick() {
    const sec = Math.floor((Date.now() - state.started) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const t = h ? `${h}h ${m}m` : `${m}m ${s.toString().padStart(2, "0")}s`;
    setText("sb-uptime", t);
    setText("sb-clock", fmtTime());
  },

  init() {
    this.setCwd(fs.cwd);
    this.setTools(12);
    this.setSaved(true);
    this.setOnline(navigator.onLine);
    window.addEventListener("online", () => this.setOnline(true));
    window.addEventListener("offline", () => this.setOnline(false));
    setInterval(() => this.tick(), 1000);
    this.tick();
  },
};

export default StatusBar;
