/* Bootstrap */

import { bus } from "./utils.js";
import { Settings } from "./settings.js";
import { Theme } from "./theme.js";
import { StatusBar } from "./statusbar.js";
import { Input } from "./input.js";
import { API } from "./api.js";
import { initShortcuts } from "./shortcuts.js";
import { openPalette } from "./commandpalette.js";
import { openSearch } from "./search.js";
import { renderWelcome, renderTree, toggleSidebar, wireChrome } from "./terminal.js";
import { TOOLS } from "./tools.js";
import { Notify } from "./notifications.js";
import { fs } from "./files.js";
import { initAuthUI, refreshKeyUI } from "./auth.js";

function initTooltips() {
  const tip = document.getElementById("tooltip");
  document.addEventListener("mousemove", (e) => {
    const t = e.target.closest("[title], [data-tip]");
    if (!t) { tip.classList.remove("show"); return; }
    const text = t.getAttribute("data-tip") || t.getAttribute("title");
    if (!text) return;
    if (t.getAttribute("title")) {
      t.setAttribute("data-tip", t.getAttribute("title"));
      t.removeAttribute("title");
    }
    tip.textContent = text;
    tip.classList.add("show");
    tip.style.left = Math.min(e.clientX + 12, window.innerWidth - 180) + "px";
    tip.style.top = (e.clientY + 16) + "px";
  });
}

async function boot() {
  Settings.apply();
  Theme.set(Settings.get("theme"));
  wireChrome();
  StatusBar.init();
  StatusBar.setTools(TOOLS.length);
  StatusBar.setCwd(fs.cwd);
  Input.init();
  initShortcuts();
  initTooltips();
  initAuthUI();
  refreshKeyUI();

  bus.on("input:submit", (text) => API.submit(text));
  bus.on("ui:palette", openPalette);
  bus.on("ui:search", () => openSearch());

  if (Settings.get("show_sidebar")) toggleSidebar(true);
  else document.getElementById("sidebar").classList.add("collapsed");

  renderWelcome();
  renderTree();
  Input.focus();

  document.getElementById("messages")?.addEventListener("click", (e) => {
    if (e.target.closest("a, button, .code-block, .tool-card, .welcome")) return;
    Input.focus();
  });
  document.getElementById("sb-cwd-wrap")?.addEventListener("click", () => bus.emit("ui:sidebar"));
  document.getElementById("sb-status")?.addEventListener("click", () => API.submit("/status"));

  const params = new URLSearchParams(location.search);
  if (params.get("cmd")) {
    setTimeout(() => API.submit(params.get("cmd")), 400);
  }

  console.log("%c✻ Claude Code Web", "color:#d97757;font-weight:700;font-size:14px");
  console.log("Type /help in the terminal. Ctrl+Shift+P for the palette.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
