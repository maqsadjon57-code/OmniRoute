/* Theme manager */

import { bus } from "./utils.js";
import { Settings } from "./settings.js";

const THEMES = ["dark", "light", "midnight", "custom"];

export const Theme = {
  list() { return THEMES; },
  current() { return Settings.get("theme") || "dark"; },
  set(name) {
    if (!THEMES.includes(name)) name = "dark";
    Settings.set("theme", name);
    document.documentElement.setAttribute("data-theme", name);
    document.body.setAttribute("data-theme", name);
    bus.emit("theme:change", name);
  },
  cycle() {
    const i = THEMES.indexOf(this.current());
    this.set(THEMES[(i + 1) % THEMES.length]);
    return this.current();
  },
  applyCustom(vars = {}) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(`--${k}`, v);
    }
  },
};

export default Theme;
