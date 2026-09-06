/* Global keybindings */

import { bus } from "./utils.js";
import { API } from "./api.js";
import { Input } from "./input.js";
import { openPalette } from "./commandpalette.js";
import { openSearch } from "./search.js";
import { Theme } from "./theme.js";
import { Tools } from "./tools.js";

function isTyping(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function initShortcuts() {
  document.addEventListener("keydown", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    const overlayOpen = !document.getElementById("overlay")?.classList.contains("hidden");

    if (e.key === "Escape") {
      if (overlayOpen) {
        document.getElementById("overlay").classList.add("hidden");
        document.getElementById("overlay").innerHTML = "";
        Input.focus();
        e.preventDefault();
        return;
      }
      if (API.isBusy()) API.cancel();
    }

    if (e.key === "c" && meta && !e.shiftKey && API.isBusy()) {
      e.preventDefault();
      API.cancel();
      return;
    }

    if (e.key === "l" && meta && !e.shiftKey) {
      if (isTyping(e.target) && e.target.id === "composer") {
        e.preventDefault();
        bus.emit("cmd:clear");
      }
    }

    if (e.key === "d" && meta && !e.shiftKey && e.target.id === "composer" && !e.target.value) {
      e.preventDefault();
      bus.emit("ui:min");
      return;
    }

    if (e.key === "r" && meta && !e.shiftKey) {
      if (e.target.id === "composer") {
        e.preventDefault();
        Input.openHistorySearch();
        return;
      }
    }

    if (e.key === "p" && meta && e.shiftKey) {
      e.preventDefault();
      openPalette();
      return;
    }

    if (e.key === "," && meta) {
      e.preventDefault();
      bus.emit("ui:settings");
      return;
    }

    if (e.key === "f" && meta && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      openSearch();
      return;
    }

    if (e.key === "b" && meta && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      bus.emit("ui:sidebar");
      return;
    }

    if (e.key === "k" && meta && e.shiftKey) {
      e.preventDefault();
      bus.emit("cmd:clear");
      return;
    }

    if (e.key === "t" && meta && e.shiftKey) {
      e.preventDefault();
      Theme.cycle();
      return;
    }

    if (e.key === "/" && !meta && !isTyping(e.target)) {
      e.preventDefault();
      Input.focus();
      return;
    }

    if (e.key === "i" && meta) {
      e.preventDefault();
      Input.focus();
      return;
    }

    if (meta && e.shiftKey) {
      const map = {
        R: () => { Input.value = "/read "; Input.focus(); },
        W: () => { Input.value = "/write "; Input.focus(); },
        E: () => { Input.value = "/edit "; Input.focus(); },
        D: () => { Input.value = "/delete "; Input.focus(); },
        S: () => openSearch(),
        L: () => API.submit("/files"),
        X: () => { Input.value = "/execute "; Input.focus(); },
        G: () => { Input.value = "/fetch "; Input.focus(); },
        U: () => API.submit("/git status"),
        H: () => bus.emit("ui:shortcuts"),
      };
      const fn = map[e.key.toUpperCase()];
      if (fn) { e.preventDefault(); fn(); }
    }

    if (e.altKey && meta && e.key.toLowerCase() === "f") {
      e.preventDefault();
      Input.value = "/web ";
      Input.focus();
    }
    if (e.altKey && meta && e.key.toLowerCase() === "b") {
      e.preventDefault();
      Input.value = "/browser ";
      Input.focus();
    }
  });
}

export const SHORTCUTS_HELP = [
  ["Submit", "Enter"],
  ["Newline", "Shift+Enter"],
  ["Autocomplete", "Tab"],
  ["History", "↑ / ↓"],
  ["Cancel", "Ctrl+C / Esc"],
  ["Clear", "Ctrl+L"],
  ["History search", "Ctrl+R"],
  ["Command palette", "Ctrl+Shift+P"],
  ["Settings", "Ctrl+,"],
  ["Search files", "Ctrl+F"],
  ["Toggle sidebar", "Ctrl+B"],
  ["Cycle theme", "Ctrl+Shift+T"],
  ["Focus input", "Ctrl+I"],
];

export default { initShortcuts, SHORTCUTS_HELP };
