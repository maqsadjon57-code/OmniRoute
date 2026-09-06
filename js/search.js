/* Project-wide content search overlay */

import { el, escapeHtml } from "./utils.js";
import { fs } from "./files.js";
import { Tools } from "./tools.js";
import { addSystem } from "./output.js";

function closeOverlay() {
  const ov = document.getElementById("overlay");
  ov.classList.add("hidden");
  ov.innerHTML = "";
}

export function openSearch(initial = "") {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");
  ov.classList.add("top");
  const panel = el("div", { class: "search-panel", role: "dialog" });
  panel.innerHTML = `
    <div class="search-input-wrap">
      <span>🔍</span>
      <input id="search-q" placeholder="Search files in the workspace…" value="${escapeHtml(initial)}" />
      <kbd>Esc</kbd>
    </div>
    <div class="search-results" id="search-results">
      <div class="palette-empty">Type to search ${fs.allFiles().length} files</div>
    </div>
  `;
  ov.innerHTML = "";
  ov.append(panel);
  const input = panel.querySelector("#search-q");
  const results = panel.querySelector("#search-results");
  let hits = [];
  let idx = 0;

  const render = () => {
    if (!hits.length) {
      results.innerHTML = `<div class="palette-empty">No matches</div>`;
      return;
    }
    results.innerHTML = hits.slice(0, 80).map((h, i) => `
      <div class="search-hit${i === idx ? " active" : ""}" data-i="${i}">
        <div class="sh-file">${escapeHtml(h.path)}:${h.line}</div>
        <div class="sh-line">${escapeHtml(h.text).replace(new RegExp(escapeReg(input.value), "ig"), (m) => `<mark>${m}</mark>`)}</div>
      </div>
    `).join("");
    results.querySelectorAll(".search-hit").forEach((n) => {
      n.addEventListener("click", () => openHit(hits[+n.dataset.i]));
    });
    results.querySelector(".search-hit.active")?.scrollIntoView({ block: "nearest" });
  };

  const run = () => {
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = `<div class="palette-empty">Type to search ${fs.allFiles().length} files</div>`;
      return;
    }
    hits = fs.search(q);
    idx = 0;
    render();
  };

  input.addEventListener("input", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "ArrowDown") { e.preventDefault(); idx = Math.min(hits.length - 1, idx + 1); render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); idx = Math.max(0, idx - 1); render(); }
    if (e.key === "Enter" && hits[idx]) { e.preventDefault(); openHit(hits[idx]); }
  });
  ov.addEventListener("click", onBg);
  function onBg(e) { if (e.target === ov) close(); }
  function close() {
    ov.removeEventListener("click", onBg);
    ov.classList.remove("top");
    closeOverlay();
    document.getElementById("composer")?.focus();
  }
  async function openHit(h) {
    close();
    addSystem(`Opening ${h.path}:${h.line}`);
    try { await Tools.Read(h.path); } catch (err) { /* ignore */ }
  }
  setTimeout(() => input.focus(), 0);
  if (initial) run();
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default { openSearch };
