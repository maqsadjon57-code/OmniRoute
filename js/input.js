/* Composer — multiline input, history, autocomplete */

import { $, bus } from "./utils.js";
import { History } from "./history.js";
import { Autocomplete } from "./autocomplete.js";
import { StatusBar } from "./statusbar.js";
import { Settings } from "./settings.js";

let disabled = false;

function composer() {
  return document.getElementById("composer");
}

function updateCursor() {
  const c = composer();
  if (!c) return;
  const v = c.value.slice(0, c.selectionStart);
  const lines = v.split("\n");
  StatusBar.setCursor(lines.length, lines[lines.length - 1].length + 1);
}

function autosize() {
  const c = composer();
  c.style.height = "auto";
  c.style.height = Math.min(c.scrollHeight, 180) + "px";
}

function replaceLastToken(insert) {
  const c = composer();
  const v = c.value;
  const start = c.selectionStart;
  const left = v.slice(0, start);
  const right = v.slice(start);
  let next;
  if (left.trim().startsWith("/") && !left.includes("\n")) {
    next = insert + (insert.endsWith(" ") ? "" : " ");
  } else {
    next = left.replace(/(@|\.?\.?\/?[\w./-]*)$/, insert) + right;
  }
  c.value = next;
  c.selectionStart = c.selectionEnd = next.length;
  autosize();
}

export const Input = {
  get value() { return composer()?.value || ""; },
  set value(v) {
    const c = composer();
    if (!c) return;
    c.value = v;
    autosize();
    Autocomplete.update(v);
    updateCursor();
  },
  focus() { composer()?.focus(); },
  clear() { this.value = ""; Autocomplete.close(); },
  setDisabled(v) {
    disabled = v;
    document.getElementById("input-dock")?.classList.toggle("disabled", v);
    const c = composer();
    if (c) c.disabled = v;
  },

  init() {
    const c = composer();
    const wrap = document.querySelector(".input-wrap");
    c.addEventListener("focus", () => wrap.classList.add("focused"));
    c.addEventListener("blur", () => wrap.classList.remove("focused"));

    c.addEventListener("input", () => {
      autosize();
      updateCursor();
      if (Settings.get("autocomplete")) Autocomplete.update(c.value);
    });

    c.addEventListener("keydown", (e) => {
      if (disabled) return;

      if (Autocomplete.isOpen()) {
        if (e.key === "ArrowDown") { e.preventDefault(); Autocomplete.move(1); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); Autocomplete.move(-1); return; }
        if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
          const ins = Autocomplete.accept();
          if (ins) {
            e.preventDefault();
            replaceLastToken(ins);
            return;
          }
        }
        if (e.key === "Escape") { Autocomplete.close(); e.preventDefault(); return; }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        Autocomplete.update(c.value);
        const ins = Autocomplete.accept();
        if (ins) replaceLastToken(ins);
        else {
          const s = c.selectionStart;
          const tab = " ".repeat(Settings.get("tab_size") || 2);
          c.value = c.value.slice(0, s) + tab + c.value.slice(c.selectionEnd);
          c.selectionStart = c.selectionEnd = s + tab.length;
        }
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = c.value;
        if (!text.trim()) return;
        History.push(text);
        this.clear();
        bus.emit("input:submit", text);
        return;
      }

      if (e.key === "ArrowUp" && !e.shiftKey && c.selectionStart === 0) {
        e.preventDefault();
        this.value = History.prev(c.value);
        return;
      }
      if (e.key === "ArrowDown" && !e.shiftKey && c.selectionStart === c.value.length) {
        e.preventDefault();
        this.value = History.next();
        return;
      }

      if (e.key === "l" && e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        bus.emit("cmd:clear");
      }
    });

    document.getElementById("hist-search-input")?.addEventListener("input", (e) => {
      const match = History.lastMatch(e.target.value);
      const el = document.getElementById("hist-match");
      if (el) el.textContent = match || "no match";
    });
    document.getElementById("hist-search-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const match = History.lastMatch(e.target.value);
        this.closeHistorySearch();
        if (match) {
          this.value = match;
        }
        e.preventDefault();
      }
      if (e.key === "Escape") {
        this.closeHistorySearch();
        e.preventDefault();
      }
    });

    updateCursor();
  },

  openHistorySearch() {
    const box = document.getElementById("hist-search");
    box.classList.add("open");
    const inp = document.getElementById("hist-search-input");
    inp.value = "";
    inp.focus();
  },
  closeHistorySearch() {
    document.getElementById("hist-search")?.classList.remove("open");
    this.focus();
  },
};

export default Input;
