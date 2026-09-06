/* Persistent settings */

import { bus, storageGet, storageSet } from "./utils.js";

const KEY = "ccweb.settings.v1";

const DEFAULTS = {
  theme: "dark",
  font: "JetBrains Mono",
  font_size: 13,
  line_height: 1.55,
  cursor_style: "block",
  cursor_blink: true,
  show_line_numbers: true,
  syntax_highlighting: true,
  autocomplete: true,
  auto_save: true,
  confirm_dangerous: true,
  streaming: true,
  sound_effects: false,
  notifications: true,
  history_size: 1000,
  tab_size: 2,
  word_wrap: true,
  show_welcome: true,
  show_sidebar: false,
  compact_mode: false,
  show_timestamps: false,
  language: "en",
  cwd: "/project",
  username: "developer",
};

function load() {
  return { ...DEFAULTS, ...(storageGet(KEY, {}) || {}) };
}

let state = load();

export const Settings = {
  all() { return { ...state }; },
  get(k) { return state[k]; },
  set(k, v) {
    state[k] = v;
    storageSet(KEY, state);
    bus.emit("settings:change", k, v, state);
    this.apply();
  },
  patch(obj) {
    Object.assign(state, obj);
    storageSet(KEY, state);
    bus.emit("settings:change", "*", null, state);
    this.apply();
  },
  reset() {
    state = { ...DEFAULTS };
    storageSet(KEY, state);
    bus.emit("settings:change", "*", null, state);
    this.apply();
  },
  apply() {
    const root = document.documentElement;
    root.style.setProperty("--line-height", String(state.line_height));
    root.style.fontSize = state.font_size + "px";
    document.body?.style.setProperty("font-family", `'${state.font}', var(--font-mono)`);
    document.body?.setAttribute("data-theme", state.theme);
    document.documentElement.setAttribute("data-theme", state.theme);
    document.body?.classList.toggle("compact", !!state.compact_mode);
    const composer = document.getElementById("composer");
    if (composer) {
      composer.style.tabSize = String(state.tab_size);
    }
  },
};

export default Settings;
