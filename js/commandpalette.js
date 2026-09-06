/* Ctrl+Shift+P command palette */

import { el, fuzzyScore, escapeHtml } from "./utils.js";
import { COMMANDS } from "./autocomplete.js";
import { TOOLS } from "./tools.js";
import { Theme } from "./theme.js";
import { bus } from "./utils.js";
import { API } from "./api.js";

const ACTIONS = [
  ...COMMANDS.map((c) => ({
    id: c.cmd,
    title: c.cmd,
    desc: c.desc,
    icon: c.icon,
    run: () => API.submit(c.cmd),
  })),
  ...TOOLS.map((t) => ({
    id: "tool:" + t.name,
    title: "Tool: " + t.name,
    desc: t.desc,
    icon: t.icon,
    run: () => {
      document.getElementById("composer").value = t.slash;
      document.getElementById("composer").focus();
    },
  })),
  { id: "theme.dark", title: "Theme: Dark", desc: "Claude dark", icon: "🌑", run: () => Theme.set("dark") },
  { id: "theme.light", title: "Theme: Light", desc: "Claude light", icon: "☀️", run: () => Theme.set("light") },
  { id: "theme.midnight", title: "Theme: Midnight", desc: "GitHub-like", icon: "🌌", run: () => Theme.set("midnight") },
  { id: "sidebar", title: "Toggle sidebar", desc: "File tree", icon: "📂", run: () => bus.emit("ui:sidebar") },
  { id: "settings", title: "Open settings", desc: "Preferences", icon: "⚙️", run: () => bus.emit("ui:settings") },
  { id: "apikey", title: "API Key", desc: "Paste Anthropic key", icon: "🔑", run: () => bus.emit("ui:apikey") },
  { id: "models", title: "Select model", desc: "Opus / Sonnet / Haiku", icon: "◈", run: () => bus.emit("ui:models") },
  { id: "clear", title: "Clear screen", desc: "Ctrl+L", icon: "🧹", run: () => bus.emit("cmd:clear") },
];

function closeOverlay() {
  const ov = document.getElementById("overlay");
  ov.classList.add("hidden");
  ov.classList.remove("top");
  ov.innerHTML = "";
}

export function openPalette() {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");
  ov.classList.add("top");
  const box = el("div", { class: "palette", role: "dialog", "aria-label": "Command palette" });
  box.innerHTML = `
    <div class="palette-input-wrap">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
      <input id="palette-q" placeholder="Type a command…" />
    </div>
    <div class="palette-list" id="palette-list"></div>
    <div class="palette-foot">
      <span><kbd>↑↓</kbd> navigate</span>
      <span><kbd>Enter</kbd> run</span>
      <span><kbd>Esc</kbd> close</span>
    </div>
  `;
  ov.innerHTML = "";
  ov.append(box);
  const input = box.querySelector("#palette-q");
  const list = box.querySelector("#palette-list");
  let shown = ACTIONS.slice();
  let idx = 0;

  const render = () => {
    if (!shown.length) {
      list.innerHTML = `<div class="palette-empty">No matching commands</div>`;
      return;
    }
    list.innerHTML = shown.slice(0, 40).map((a, i) => `
      <div class="palette-item${i === idx ? " active" : ""}" data-i="${i}">
        <span class="pi-icon">${a.icon || "›"}</span>
        <span class="pi-title">${escapeHtml(a.title)}</span>
        <span class="pi-desc">${escapeHtml(a.desc || "")}</span>
      </div>
    `).join("");
    list.querySelectorAll(".palette-item").forEach((n) => {
      n.addEventListener("click", () => run(shown[+n.dataset.i]));
    });
    list.querySelector(".palette-item.active")?.scrollIntoView({ block: "nearest" });
  };

  const filter = () => {
    const q = input.value.trim();
    shown = ACTIONS
      .map((a) => ({ ...a, score: fuzzyScore(q, a.title + " " + (a.desc || "")) }))
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score);
    idx = 0;
    render();
  };

  async function run(a) {
    close();
    await a.run();
  }
  function close() {
    ov.removeEventListener("click", onBg);
    closeOverlay();
    document.getElementById("composer")?.focus();
  }
  function onBg(e) { if (e.target === ov) close(); }

  input.addEventListener("input", filter);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "ArrowDown") { e.preventDefault(); idx = Math.min(shown.length - 1, idx + 1); render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); idx = Math.max(0, idx - 1); render(); }
    if (e.key === "Enter") { e.preventDefault(); if (shown[idx]) run(shown[idx]); }
  });
  ov.addEventListener("click", onBg);
  filter();
  setTimeout(() => input.focus(), 0);
}

export default { openPalette };
