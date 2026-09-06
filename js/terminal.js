/* Window chrome, welcome, settings, file tree, dialogs */

import { $, $$, el, escapeHtml, iconFor, basename, fmtBytes, bus } from "./utils.js";
import { fs } from "./files.js";
import { Settings } from "./settings.js";
import { Theme } from "./theme.js";
import { StatusBar } from "./statusbar.js";
import { addSystem, clearMessages, addHtml, addAssistant } from "./output.js";
import { Conversation } from "./history.js";
import { Notify } from "./notifications.js";
import { SHORTCUTS_HELP } from "./shortcuts.js";
import { TOOLS, Tools } from "./tools.js";
import { Input } from "./input.js";
import { hydrateMarkdownCode } from "./codeblock.js";
import { renderMarkdown } from "./markdown.js";

export function renderWelcome() {
  const box = document.getElementById("messages");
  const welcome = el("div", { class: "welcome" });
  welcome.innerHTML = `
    <div class="welcome-head">
      <span class="welcome-mark">✻</span>
      <h1>Welcome to Claude Code</h1>
    </div>
    <p>I'm an AI coding assistant that lives in the terminal — now in your browser.</p>
    <p>/help for help, /status for your current setup · Ctrl+Shift+P command palette</p>
    <div class="cwd">cwd: <span>${escapeHtml(fs.cwd)}</span></div>
  `;
  box.append(welcome);

  const tips = el("div", { class: "tips" });
  tips.innerHTML = `
    Tips for getting started
    <ul class="tips-list">
      <li>Ask me to <code>create a python hello world</code></li>
      <li>Run <code>/files</code> to inspect the virtual workspace</li>
      <li>Press <code>Ctrl+Shift+P</code> to open the command palette</li>
      <li>Dangerous commands open a permission dialog</li>
    </ul>
  `;
  box.append(tips);
}

export function refreshTitle() {
  const cols = Math.max(40, Math.round((document.querySelector(".terminal")?.clientWidth || 640) / 8.2));
  const rows = Math.max(12, Math.round((document.querySelector(".messages")?.clientHeight || 400) / 20));
  const el = document.getElementById("title-text");
  if (el) el.innerHTML = `<span class="brand">claude-code</span> — bash — ${cols}×${rows}`;
}

export function renderTree() {
  const tree = document.getElementById("tree");
  if (!tree) return;
  tree.innerHTML = "";

  const walk = (dir, depth) => {
    const items = fs.list(dir);
    for (const it of items) {
      const row = el("div", { class: "tree-item" + (it.path === selectedPath ? " active" : "") });
      row.style.paddingLeft = (8 + depth * 12) + "px";
      row.innerHTML = `<span class="tw">${it.isDir ? "▾" : " "}</span><span class="ti">${iconFor(it.path, it.isDir)}</span><span>${escapeHtml(it.name)}</span>`;
      row.addEventListener("click", async () => {
        selectedPath = it.path;
        renderTree();
        if (it.isDir) fs.cd(it.path);
        else {
          try { await Tools.Read(it.path); } catch (e) { Notify.error(e.message); }
        }
      });
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openCtx(e.clientX, e.clientY, it);
      });
      tree.append(row);
      if (it.isDir) walk(it.path, depth + 1);
    }
  };
  walk(fs.cwd.split("/").slice(0, 2).join("/") || "/project", 0);
  const foot = document.getElementById("sidebar-foot");
  if (foot) foot.textContent = fs.summary();
}

let selectedPath = null;

function openCtx(x, y, it) {
  let menu = document.getElementById("ctx-menu");
  if (!menu) {
    menu = el("div", { class: "ctx-menu", id: "ctx-menu" });
    document.body.append(menu);
  }
  menu.innerHTML = `
    <div class="ctx-item" data-a="open">Open</div>
    <div class="ctx-item" data-a="copy">Copy path</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" data-a="del">Delete</div>
  `;
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.classList.add("open");
  const close = () => { menu.classList.remove("open"); document.removeEventListener("click", close); };
  menu.querySelectorAll(".ctx-item").forEach((n) => n.addEventListener("click", async () => {
    if (n.dataset.a === "open") {
      if (it.isDir) fs.cd(it.path);
      else await Tools.Read(it.path);
    }
    if (n.dataset.a === "copy") navigator.clipboard.writeText(it.path);
    if (n.dataset.a === "del") await Tools.Delete(it.path);
    close();
  }));
  setTimeout(() => document.addEventListener("click", close), 0);
}

export function toggleSidebar(force) {
  const sb = document.getElementById("sidebar");
  const on = force ?? sb.classList.contains("collapsed");
  sb.classList.toggle("collapsed", !on);
  Settings.set("show_sidebar", on);
  document.getElementById("btn-sidebar")?.classList.toggle("active", on);
  if (on) renderTree();
}

export function openSettings() {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");
  const panel = el("div", { class: "settings-panel" });
  const s = Settings.all();
  panel.innerHTML = `
    <div class="settings-head">
      <span>⚙️ Settings</span>
      <button class="icon-btn" id="set-close" title="Close">✕</button>
    </div>
    <div class="settings-body">
      <div class="settings-group"><h3>Appearance</h3>
        ${rowSelect("theme", "Theme", s.theme, ["dark", "light", "midnight", "custom"])}
        ${rowSelect("font", "Font", s.font, ["JetBrains Mono", "Fira Code", "Menlo", "Consolas", "Monaco"])}
        ${rowNumber("font_size", "Font size", s.font_size, 11, 20)}
        ${rowNumber("line_height", "Line height", s.line_height, 1.2, 2.0, 0.05)}
        ${rowSelect("cursor_style", "Cursor", s.cursor_style, ["block", "bar", "underline"])}
        ${rowToggle("cursor_blink", "Blinking cursor", s.cursor_blink)}
        ${rowToggle("compact_mode", "Compact mode", s.compact_mode)}
      </div>
      <div class="settings-group"><h3>Editor</h3>
        ${rowToggle("show_line_numbers", "Line numbers", s.show_line_numbers)}
        ${rowToggle("syntax_highlighting", "Syntax highlighting", s.syntax_highlighting)}
        ${rowToggle("word_wrap", "Word wrap", s.word_wrap)}
        ${rowNumber("tab_size", "Tab size", s.tab_size, 2, 8)}
        ${rowToggle("autocomplete", "Autocomplete", s.autocomplete)}
      </div>
      <div class="settings-group"><h3>Agent</h3>
        ${rowToggle("streaming", "Stream replies", s.streaming)}
        ${rowToggle("confirm_dangerous", "Confirm dangerous commands", s.confirm_dangerous)}
        ${rowToggle("notifications", "Notifications", s.notifications)}
        ${rowToggle("sound_effects", "Sound effects", s.sound_effects)}
        ${rowToggle("auto_save", "Auto-save workspace", s.auto_save)}
        ${rowToggle("show_timestamps", "Timestamps", s.show_timestamps)}
        ${rowNumber("history_size", "History size", s.history_size, 50, 5000, 50)}
      </div>
      <div class="settings-group">
        <button class="btn" id="set-reset">Reset to defaults</button>
      </div>
    </div>
  `;
  ov.innerHTML = "";
  ov.append(panel);

  panel.querySelectorAll("[data-set]").forEach((n) => {
    const key = n.dataset.set;
    const apply = () => {
      let v;
      if (n.type === "checkbox" || n.classList.contains("toggle")) v = n.classList.contains("on");
      else if (n.type === "number") v = Number(n.value);
      else v = n.value;
      Settings.set(key, v);
      if (key === "theme") Theme.set(v);
    };
    if (n.classList.contains("toggle")) {
      n.addEventListener("click", () => { n.classList.toggle("on"); Settings.set(key, n.classList.contains("on")); });
    } else {
      n.addEventListener("change", () => {
        const v = n.type === "number" ? Number(n.value) : n.value;
        Settings.set(key, v);
        if (key === "theme") Theme.set(v);
      });
    }
  });
  panel.querySelector("#set-close").addEventListener("click", closeOv);
  panel.querySelector("#set-reset").addEventListener("click", () => {
    Settings.reset();
    Theme.set(Settings.get("theme"));
    closeOv();
    openSettings();
  });
  ov.addEventListener("click", onBg);
  function onBg(e) { if (e.target === ov) closeOv(); }
  function closeOv() {
    ov.removeEventListener("click", onBg);
    ov.classList.add("hidden");
    ov.innerHTML = "";
    Input.focus();
  }
}

function rowToggle(key, label, val) {
  return `<div class="setting-row"><label>${label}</label><div class="toggle${val ? " on" : ""}" data-set="${key}"></div></div>`;
}
function rowSelect(key, label, val, opts) {
  return `<div class="setting-row"><label>${label}</label><select data-set="${key}">${opts.map((o) => `<option${o === val ? " selected" : ""}>${o}</option>`).join("")}</select></div>`;
}
function rowNumber(key, label, val, min, max, step = 1) {
  return `<div class="setting-row"><label>${label}</label><input type="number" data-set="${key}" value="${val}" min="${min}" max="${max}" step="${step}" /></div>`;
}

export function openShortcuts() {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");
  const modal = el("div", { class: "modal" });
  modal.innerHTML = `
    <div class="modal-head">⌨️ Keyboard shortcuts</div>
    <div class="modal-body">
      <div class="help-grid">
        ${SHORTCUTS_HELP.map(([a, b]) => `<div class="hk"><span>${a}</span><kbd>${b}</kbd></div>`).join("")}
      </div>
    </div>
    <div class="modal-actions"><button class="btn btn-primary" id="sc-ok">Close</button></div>
  `;
  ov.innerHTML = "";
  ov.append(modal);
  modal.querySelector("#sc-ok").addEventListener("click", () => {
    ov.classList.add("hidden"); ov.innerHTML = ""; Input.focus();
  });
  ov.addEventListener("click", function onBg(e) {
    if (e.target === ov) { ov.removeEventListener("click", onBg); ov.classList.add("hidden"); ov.innerHTML = ""; }
  });
}

export function openImport() {
  const inp = el("input", { type: "file", accept: "application/json,.json,.md" });
  inp.addEventListener("change", async () => {
    const file = inp.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const n = Conversation.importJSON(text);
      Notify.success("Imported", n + " messages");
    } catch {
      Notify.error("Import failed", "Expected a conversation JSON file");
    }
  });
  inp.click();
}

export function wireChrome() {
  $("#btn-close")?.addEventListener("click", () => {
    if (confirm("Close Claude Code Web?")) {
      document.getElementById("app").style.display = "none";
      document.body.style.background = "#0e0e0e";
      document.body.innerHTML += `<div style="color:#6b6b6b;font-family:var(--font-mono);text-align:center;margin-top:30vh">Session closed. Refresh to reopen.</div>`;
    }
  });
  $("#btn-min")?.addEventListener("click", () => document.getElementById("app").classList.toggle("minimized"));
  $("#btn-max")?.addEventListener("click", () => document.getElementById("app").classList.toggle("maximized"));
  $("#btn-sidebar")?.addEventListener("click", () => toggleSidebar());
  $("#btn-settings")?.addEventListener("click", () => openSettings());
  $("#btn-search")?.addEventListener("click", () => bus.emit("ui:search"));
  $("#btn-palette")?.addEventListener("click", () => bus.emit("ui:palette"));

  bus.on("ui:settings", openSettings);
  bus.on("ui:shortcuts", openShortcuts);
  bus.on("ui:sidebar", () => toggleSidebar());
  bus.on("ui:min", () => document.getElementById("app").classList.toggle("minimized"));
  bus.on("ui:import", openImport);
  bus.on("fs:change", () => renderTree());
  bus.on("fs:cwd", (p) => { StatusBar.setCwd(p); refreshTitle(); });

  bus.on("cmd:clear", () => {
    clearMessages();
    addSystem("Screen cleared. Conversation memory is kept — /reset to wipe it.");
  });
  bus.on("cmd:welcome", () => {
    clearMessages();
    Conversation.clear();
    renderWelcome();
  });

  const term = document.querySelector(".terminal");
  term?.addEventListener("dragover", (e) => { e.preventDefault(); term.classList.add("dragover"); });
  term?.addEventListener("dragleave", () => term.classList.remove("dragover"));
  term?.addEventListener("drop", async (e) => {
    e.preventDefault();
    term.classList.remove("dragover");
    for (const file of e.dataTransfer.files) {
      const text = await file.text();
      const path = fs.normalize(file.name);
      fs.write(path, text);
      addSystem(`Imported ${path} (${fmtBytes(text.length)})`);
    }
  });

  window.addEventListener("resize", refreshTitle);
  refreshTitle();
}

export default { renderWelcome, renderTree, toggleSidebar, openSettings, wireChrome, refreshTitle };
