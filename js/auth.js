/* API key modal + model picker */

import { el, escapeHtml, bus } from "./utils.js";
import { Keys } from "./keys.js";
import { MODELS, findModel, DEFAULT_MODEL, shortName } from "./models.js";
import { Settings } from "./settings.js";
import { Claude } from "./claude.js";
import { Notify } from "./notifications.js";
import { Input } from "./input.js";

function overlay() {
  return document.getElementById("overlay");
}

function closeOverlay() {
  const ov = overlay();
  ov.classList.add("hidden");
  ov.classList.remove("top");
  ov.innerHTML = "";
}

export function currentModelId() {
  return Settings.get("model") || DEFAULT_MODEL;
}

export function refreshKeyUI() {
  const btn = document.getElementById("btn-apikey");
  if (btn) {
    btn.classList.toggle("missing", !Keys.has());
    btn.classList.toggle("ok", Keys.has());
    const label = btn.querySelector(".key-label");
    if (label) label.textContent = Keys.has() ? "API Key" : "API Key";
    btn.title = Keys.has() ? `API key ${Keys.masked()}` : "Paste your Anthropic API key";
  }
  const sb = document.getElementById("sb-key");
  if (sb) sb.textContent = Keys.has() ? Keys.masked() : "no key";
  const dot = document.getElementById("sb-key-wrap");
  if (dot) {
    dot.classList.toggle("key-missing", !Keys.has());
    dot.classList.toggle("key-ok", Keys.has());
  }
  refreshModelUI();
}

export function refreshModelUI() {
  const m = findModel(currentModelId());
  const label = document.getElementById("model-label");
  if (label) label.textContent = m.name;
  const icon = document.getElementById("model-icon");
  if (icon) icon.textContent = m.icon;
  const sb = document.getElementById("sb-model");
  if (sb) sb.textContent = m.name;
  const chip = document.getElementById("btn-model");
  if (chip) chip.title = `${m.name} · ${m.id}`;
}

export function setModel(id) {
  Settings.set("model", id);
  refreshModelUI();
  Notify.info("Model", shortName(id));
  bus.emit("model:change", id);
}

export function openApiKeyModal() {
  const ov = overlay();
  ov.classList.remove("hidden");
  const modal = el("div", { class: "modal apikey-modal", role: "dialog", "aria-label": "API Key" });
  const has = Keys.has();
  modal.innerHTML = `
    <div class="modal-head">🔑 Anthropic API Key</div>
    <div class="modal-body">
      <p>Paste a key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. It stays in this browser only (localStorage) and is sent to Anthropic as <code>x-api-key</code>.</p>
      <label class="field-label">API key</label>
      <div class="key-input-row">
        <input id="apikey-input" type="password" placeholder="sk-ant-api03-…" spellcheck="false" autocomplete="off" value="${escapeHtml(Keys.get())}" />
        <button type="button" class="btn" id="apikey-toggle">Show</button>
      </div>
      <label class="field-label">API base URL</label>
      <input id="apibase-input" type="text" value="${escapeHtml(Keys.base())}" spellcheck="false" />
      <div class="perm-meta" id="apikey-status">${has ? "Saved key: " + Keys.masked() : "No key saved — local demo agent is used until you add one."}</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-danger" id="apikey-clear">Clear</button>
      <button class="btn" id="apikey-test">Test</button>
      <button class="btn btn-ghost" id="apikey-cancel">Cancel</button>
      <button class="btn btn-primary" id="apikey-save">Save key</button>
    </div>
  `;
  ov.innerHTML = "";
  ov.append(modal);

  const input = modal.querySelector("#apikey-input");
  const base = modal.querySelector("#apibase-input");
  const status = modal.querySelector("#apikey-status");
  modal.querySelector("#apikey-toggle").addEventListener("click", (e) => {
    const hide = input.type === "password";
    input.type = hide ? "text" : "password";
    e.currentTarget.textContent = hide ? "Hide" : "Show";
  });
  modal.querySelector("#apikey-cancel").addEventListener("click", close);
  modal.querySelector("#apikey-clear").addEventListener("click", () => {
    Keys.clear();
    input.value = "";
    refreshKeyUI();
    Notify.warning("API key cleared");
    close();
  });
  modal.querySelector("#apikey-save").addEventListener("click", () => {
    const v = input.value.trim();
    Keys.setBase(base.value.trim());
    if (!v) {
      Keys.clear();
      Notify.warning("API key cleared");
    } else {
      Keys.set(v);
      Notify.success("API key saved", Keys.masked());
    }
    refreshKeyUI();
    close();
  });
  modal.querySelector("#apikey-test").addEventListener("click", async () => {
    const v = input.value.trim() || Keys.get();
    if (!v) { status.textContent = "Paste a key first."; return; }
    Keys.setBase(base.value.trim());
    status.textContent = "Testing…";
    try {
      const data = await Claude.testKey(v);
      const n = Array.isArray(data?.data) ? data.data.length : 0;
      status.textContent = n ? `OK — ${n} models visible.` : "OK — key accepted.";
      status.style.color = "var(--success)";
      Notify.success("Key valid", n ? n + " models" : "connected");
    } catch (err) {
      status.textContent = err.message || "Failed";
      status.style.color = "var(--error)";
      Notify.error("Key test failed", err.message);
    }
  });
  ov.addEventListener("click", onBg);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") modal.querySelector("#apikey-save").click();
    if (e.key === "Escape") close();
  });
  setTimeout(() => input.focus(), 0);

  function onBg(e) { if (e.target === ov) close(); }
  function close() {
    ov.removeEventListener("click", onBg);
    closeOverlay();
    Input.focus();
  }
}

export function openModelPicker(anchor) {
  let menu = document.getElementById("model-menu");
  if (menu) menu.remove();
  menu = el("div", { class: "model-menu", id: "model-menu" });
  const cur = currentModelId();
  const groups = [...new Set(MODELS.map((m) => m.family))];
  let html = `<div class="model-menu-head">Select model</div>`;
  for (const g of groups) {
    html += `<div class="model-group">${escapeHtml(g)}</div>`;
    for (const m of MODELS.filter((x) => x.family === g)) {
      html += `
        <button type="button" class="model-item${m.id === cur ? " active" : ""}" data-id="${escapeHtml(m.id)}">
          <span class="mi-icon">${m.icon}</span>
          <span class="mi-body">
            <span class="mi-name">${escapeHtml(m.name)}${m.tag ? ` <em>${escapeHtml(m.tag)}</em>` : ""}</span>
            <span class="mi-desc">${escapeHtml(m.desc)}</span>
          </span>
          ${m.id === cur ? '<span class="mi-check">✓</span>' : ""}
        </button>`;
    }
  }
  html += `<div class="model-custom">
    <input id="model-custom-id" placeholder="Custom model id…" value="${escapeHtml(cur)}" />
    <button type="button" class="btn" id="model-custom-apply">Use</button>
  </div>`;
  menu.innerHTML = html;
  document.body.append(menu);

  const rect = (anchor || document.getElementById("btn-model"))?.getBoundingClientRect();
  if (rect) {
    const w = 320;
    let left = rect.right - w;
    if (left < 8) left = 8;
    menu.style.left = left + "px";
    menu.style.top = (rect.bottom + 6) + "px";
  }

  menu.querySelectorAll(".model-item").forEach((b) => {
    b.addEventListener("click", () => {
      setModel(b.dataset.id);
      dismiss();
    });
  });
  menu.querySelector("#model-custom-apply")?.addEventListener("click", () => {
    const id = menu.querySelector("#model-custom-id").value.trim();
    if (id) setModel(id);
    dismiss();
  });

  const onDoc = (e) => {
    if (!menu.contains(e.target) && e.target !== anchor && !e.target.closest?.("#btn-model, #sb-model-wrap")) {
      dismiss();
    }
  };
  setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
  function dismiss() {
    document.removeEventListener("mousedown", onDoc);
    menu.remove();
  }
}

export function initAuthUI() {
  document.getElementById("btn-apikey")?.addEventListener("click", openApiKeyModal);
  document.getElementById("btn-model")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openModelPicker(e.currentTarget);
  });
  document.getElementById("sb-model-wrap")?.addEventListener("click", (e) => {
    openModelPicker(e.currentTarget);
  });
  document.getElementById("sb-key-wrap")?.addEventListener("click", openApiKeyModal);
  bus.on("ui:apikey", openApiKeyModal);
  bus.on("ui:models", () => openModelPicker(document.getElementById("btn-model")));
  bus.on("keys:change", refreshKeyUI);
  bus.on("model:change", refreshModelUI);
  bus.on("settings:change", (k) => {
    if (k === "model" || k === "*") refreshModelUI();
  });
  refreshKeyUI();
}

export default { openApiKeyModal, openModelPicker, initAuthUI, refreshKeyUI, setModel };
