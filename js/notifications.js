/* Toasts + optional sound */

import { el } from "./utils.js";
import { Settings } from "./settings.js";

let root;

function ensure() {
  if (!root) root = document.getElementById("toasts");
  return root;
}

function beep(kind) {
  if (!Settings.get("sound_effects")) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = kind === "error" ? 220 : kind === "success" ? 880 : 520;
    g.gain.value = 0.04;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 90);
  } catch { /* ignore */ }
}

export const Notify = {
  show(title, body = "", kind = "info", ms = 3200) {
    if (!Settings.get("notifications") && kind !== "error") return;
    const host = ensure();
    if (!host) return;
    const t = el("div", { class: `toast ${kind}` });
    t.innerHTML = `<div class="toast-title">${title}</div>${body ? `<div class="toast-body">${body}</div>` : ""}`;
    host.append(t);
    beep(kind);
    const close = () => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 200);
    };
    t.addEventListener("click", close);
    if (ms > 0) setTimeout(close, ms);
    return t;
  },
  success(title, body) { return this.show(title, body, "success"); },
  error(title, body) { return this.show(title, body, "error", 5000); },
  warning(title, body) { return this.show(title, body, "warning"); },
  info(title, body) { return this.show(title, body, "info"); },
};

export default Notify;
