/* Slash-command + path autocomplete */

import { $, el, fuzzyScore, basename } from "./utils.js";
import { fs } from "./files.js";
import { TOOLS } from "./tools.js";

export const COMMANDS = [
  { cmd: "/help", desc: "Show available commands", icon: "❓" },
  { cmd: "/clear", desc: "Clear the screen", icon: "🧹" },
  { cmd: "/reset", desc: "Reset the conversation", icon: "↺" },
  { cmd: "/history", desc: "Show command history", icon: "🕘" },
  { cmd: "/settings", desc: "Open settings", icon: "⚙️" },
  { cmd: "/theme", desc: "Cycle or set theme", icon: "🎨" },
  { cmd: "/tools", desc: "List built-in tools", icon: "🔧" },
  { cmd: "/files", desc: "List files in cwd", icon: "📁" },
  { cmd: "/tree", desc: "Show directory tree", icon: "🌳" },
  { cmd: "/search", desc: "Search file contents", icon: "🔍" },
  { cmd: "/execute", desc: "Run a shell command", icon: "⚡" },
  { cmd: "/read", desc: "Read a file", icon: "📄" },
  { cmd: "/write", desc: "Create / overwrite a file", icon: "📝" },
  { cmd: "/edit", desc: "Edit a file", icon: "✏️" },
  { cmd: "/delete", desc: "Delete a file", icon: "🗑" },
  { cmd: "/git", desc: "Git operations", icon: "🔀" },
  { cmd: "/export", desc: "Export conversation", icon: "📤" },
  { cmd: "/import", desc: "Import conversation", icon: "📥" },
  { cmd: "/shortcuts", desc: "Keyboard shortcuts", icon: "⌨️" },
  { cmd: "/status", desc: "Session status", icon: "📊" },
  { cmd: "/version", desc: "Version info", icon: "ℹ️" },
  { cmd: "/sidebar", desc: "Toggle file sidebar", icon: "📂" },
  { cmd: "/cwd", desc: "Print or change directory", icon: "📁" },
  { cmd: "/save", desc: "Save workspace", icon: "💾" },
  { cmd: "/new", desc: "New conversation", icon: "✨" },
  { cmd: "/model", desc: "List or set Claude model", icon: "◈" },
  { cmd: "/apikey", desc: "Set Anthropic API key", icon: "🔑" },
  { cmd: "/exit", desc: "Quit (minimizes window)", icon: "🚪" },
];

let items = [];
let index = 0;

function menu() {
  return document.getElementById("ac-menu");
}

function render() {
  const m = menu();
  if (!m) return;
  m.innerHTML = "";
  items.forEach((it, i) => {
    const row = el("div", { class: `ac-item${i === index ? " active" : ""}` });
    row.innerHTML = `<span class="ac-icon">${it.icon || "›"}</span><span class="ac-cmd">${it.label}</span><span class="ac-desc">${it.desc || ""}</span>`;
    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
      index = i;
      accept();
    });
    m.append(row);
  });
  m.classList.toggle("open", items.length > 0);
  m.querySelector(".ac-item.active")?.scrollIntoView({ block: "nearest" });
}

export const Autocomplete = {
  isOpen() { return items.length > 0 && menu()?.classList.contains("open"); },

  update(value) {
    const line = value.split("\n").pop() || "";
    items = [];
    index = 0;

    if (line.startsWith("/")) {
      const q = line.trim();
      items = COMMANDS
        .map((c) => ({ ...c, label: c.cmd, score: fuzzyScore(q, c.cmd) }))
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((c) => ({ icon: c.icon, label: c.cmd, desc: c.desc, insert: c.cmd + " " }));
    } else if (/\s(\.?\.?\/?[\w./-]*)$/.test(line) || /^@/.test(line)) {
      const m = line.match(/(@|\.?\.?\/?[\w./-]*)$/);
      const q = (m ? m[1] : "").replace(/^@/, "");
      items = fs.allFiles()
        .map((p) => ({ path: p, score: fuzzyScore(q, p) + fuzzyScore(q, basename(p)) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((x) => ({ icon: "📄", label: x.path, desc: "file", insert: x.path }));
    } else if (line.startsWith("?")) {
      const q = line.slice(1);
      items = (TOOLS || [])
        .map((t) => ({ ...t, score: fuzzyScore(q, t.name + t.desc) }))
        .filter((t) => t.score > 0)
        .slice(0, 8)
        .map((t) => ({ icon: t.icon, label: t.name, desc: t.desc, insert: t.slash }));
    }
    render();
  },

  move(dir) {
    if (!items.length) return;
    index = (index + dir + items.length) % items.length;
    render();
  },

  accept() {
    if (!items.length) return null;
    const it = items[index];
    this.close();
    return it.insert;
  },

  close() {
    items = [];
    index = 0;
    menu()?.classList.remove("open");
    if (menu()) menu().innerHTML = "";
  },
};

export default Autocomplete;
