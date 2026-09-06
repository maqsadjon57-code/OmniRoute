/* Permission dialog + policy */

import { $, el, isDangerous, storageGet, storageSet } from "./utils.js";
import { Settings } from "./settings.js";

const KEY = "ccweb.perms.v1";

const ALWAYS = new Set(storageGet(KEY, { always: [] }).always || []);
const NEVER = new Set(storageGet(KEY, { never: [] }).never || []);

function persist() {
  storageSet(KEY, { always: [...ALWAYS], never: [...NEVER] });
}

function keyOf(tool, arg) {
  return `${tool}::${String(arg || "").slice(0, 80)}`;
}

function openOverlay(node) {
  const ov = document.getElementById("overlay");
  ov.innerHTML = "";
  ov.append(node);
  ov.classList.remove("hidden");
  return ov;
}

function closeOverlay() {
  const ov = document.getElementById("overlay");
  ov.classList.add("hidden");
  ov.innerHTML = "";
}

export const Permissions = {
  always: ALWAYS,
  never: NEVER,

  async request({ tool, title, command, cwd, dangerous = false, detail = "" }) {
    if (!Settings.get("confirm_dangerous") && !dangerous) return "allow";
    const k = keyOf(tool, command);
    if (NEVER.has(k) || NEVER.has(tool)) return "never";
    if (ALWAYS.has(k) || ALWAYS.has(tool)) return "always";

    const needs = dangerous || isDangerous(command) || Settings.get("confirm_dangerous") && ["Execute", "Delete", "Git", "Terminal"].includes(tool);
    if (!needs && !["Execute", "Delete", "Terminal"].includes(tool)) return "allow";

    return new Promise((resolve) => {
      const modal = el("div", { class: "modal", role: "dialog", "aria-modal": "true" });
      modal.innerHTML = `
        <div class="modal-head warn">🔐 Permission required</div>
        <div class="modal-body">
          <p>Claude wants to <strong>${title || tool}</strong>.</p>
          ${command ? `<div class="perm-cmd"><span class="dollar">$</span> ${escape(command)}</div>` : ""}
          ${cwd ? `<div class="perm-meta">📁 Working directory: ${escape(cwd)}</div>` : ""}
          ${detail ? `<div class="perm-meta">${escape(detail)}</div>` : ""}
          ${dangerous || isDangerous(command) ? `<div class="perm-warn">⚠️ This action may be destructive. Review it before allowing.</div>` : ""}
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-v="never">⛔ Never</button>
          <button class="btn" data-v="always">⏭ Always</button>
          <button class="btn btn-danger" data-v="deny">❌ Deny</button>
          <button class="btn btn-primary" data-v="allow">✅ Allow</button>
        </div>
      `;
      const ov = openOverlay(modal);
      const done = (v) => {
        ov.removeEventListener("click", onBg);
        document.removeEventListener("keydown", onKey);
        closeOverlay();
        if (v === "always") { ALWAYS.add(tool); persist(); }
        if (v === "never") { NEVER.add(tool); persist(); }
        resolve(v);
      };
      modal.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => done(b.dataset.v)));
      const onBg = (e) => { if (e.target === ov) done("deny"); };
      const onKey = (e) => {
        if (e.key === "Escape") done("deny");
        if (e.key === "Enter" && !e.shiftKey) done("allow");
      };
      ov.addEventListener("click", onBg);
      document.addEventListener("keydown", onKey);
      modal.querySelector(".btn-primary")?.focus();
    });
  },

  reset() {
    ALWAYS.clear();
    NEVER.clear();
    persist();
  },
};

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default Permissions;
