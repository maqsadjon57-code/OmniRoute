/* Message rendering into the terminal */

import { el, escapeHtml, fmtTime, uid } from "./utils.js";
import { renderMarkdown } from "./markdown.js";
import { hydrateMarkdownCode, renderCodeBlock } from "./codeblock.js";
import { Conversation } from "./history.js";
import { Settings } from "./settings.js";

export function messagesEl() {
  return document.getElementById("messages");
}

export function scrollToBottom(force = false) {
  const box = messagesEl();
  if (!box) return;
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  if (force || near) box.scrollTop = box.scrollHeight;
}

export function addMessage({ role = "assistant", text = "", html = null, gutter = null, meta = "", persist = true }) {
  const box = messagesEl();
  const msg = el("div", { class: `msg ${role}`, id: uid("msg") });
  const g =
    gutter ??
    (role === "user" ? "❯" : role === "assistant" ? "✻" : role === "error-msg" ? "✖" : "·");
  const time = Settings.get("show_timestamps") ? `<div class="msg-meta">${fmtTime()}${meta ? " · " + meta : ""}</div>` : "";
  const body = el("div", { class: "msg-body" });
  if (html) body.innerHTML = html;
  else if (role === "user") body.textContent = text;
  else {
    hydrateMarkdownCode(renderMarkdown(text), body);
  }
  msg.innerHTML = `<div class="msg-row"><div class="msg-gutter">${g}</div></div>`;
  const row = msg.querySelector(".msg-row");
  const col = el("div", { style: { flex: "1", minWidth: "0" } });
  if (time) col.insertAdjacentHTML("afterbegin", time);
  col.append(body);
  row.append(col);
  box.append(msg);
  scrollToBottom(true);
  if (persist && (text || html)) Conversation.add({ role, text, gutter: g });
  return { msg, body };
}

export function addUser(text) {
  return addMessage({ role: "user", text, gutter: "❯" });
}

export function addAssistant(text) {
  return addMessage({ role: "assistant", text, gutter: "✻" });
}

export function addSystem(text) {
  return addMessage({ role: "system", text, gutter: "·" });
}

export function addError(text) {
  return addMessage({ role: "error-msg", text, gutter: "✖" });
}

export function addRaw(node) {
  const box = messagesEl();
  box.append(node);
  scrollToBottom(true);
  return node;
}

export function addHtml(html, role = "assistant", gutter = "✻") {
  return addMessage({ role, html, gutter });
}

export function addCode(code, opts) {
  const wrap = el("div", { class: "msg assistant" });
  wrap.innerHTML = `<div class="msg-row"><div class="msg-gutter">✻</div><div class="msg-body"></div></div>`;
  wrap.querySelector(".msg-body").append(renderCodeBlock(code, opts));
  addRaw(wrap);
  return wrap;
}

export function addDiff(path, before, after) {
  const a = String(before).split("\n");
  const b = String(after).split("\n");
  // simple LCS-ish line diff (Myers-lite)
  const rows = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      rows.push({ t: "ctx", n: i + 1, s: a[i] });
      i++; j++;
    } else if (j < b.length && (i >= a.length || !a.slice(i).includes(b[j]))) {
      rows.push({ t: "add", n: j + 1, s: b[j] });
      j++;
    } else if (i < a.length && (j >= b.length || !b.slice(j).includes(a[i]))) {
      rows.push({ t: "del", n: i + 1, s: a[i] });
      i++;
    } else {
      rows.push({ t: "del", n: i + 1, s: a[i++] });
      rows.push({ t: "add", n: j + 1, s: b[j++] });
    }
  }
  const view = el("div", { class: "diff-view" });
  view.innerHTML = `<div class="diff-head"><span>✎ ${escapeHtml(path)}</span><span>${rows.filter(r=>r.t==='add').length} additions · ${rows.filter(r=>r.t==='del').length} deletions</span></div>`;
  const body = el("div");
  for (const r of rows.slice(0, 400)) {
    const line = el("div", { class: `diff-line ${r.t === "add" ? "add" : r.t === "del" ? "del" : ""}` });
    line.innerHTML = `<span class="ln">${r.n}</span><span class="dx">${r.t === "add" ? "+" : r.t === "del" ? "-" : " "}${escapeHtml(r.s)}</span>`;
    body.append(line);
  }
  view.append(body);
  const wrap = el("div", { class: "msg assistant" });
  wrap.innerHTML = `<div class="msg-row"><div class="msg-gutter">✻</div><div class="msg-body"></div></div>`;
  wrap.querySelector(".msg-body").append(view);
  addRaw(wrap);
  return wrap;
}

export function clearMessages() {
  const box = messagesEl();
  box.innerHTML = "";
}

export function makeToolCard({ name, arg, icon = "🔧" }) {
  const card = el("div", { class: "tool-card running" });
  card.innerHTML = `
    <div class="tool-card-head">
      <span class="tool-icon">${icon}</span>
      <span class="tool-name">${escapeHtml(name)}</span>
      <span class="tool-arg">${escapeHtml(arg || "")}</span>
      <span class="tool-status">running</span>
    </div>
    <div class="tool-card-body"></div>
  `;
  card.querySelector(".tool-card-head").addEventListener("click", () => card.classList.toggle("open"));
  const wrap = el("div", { class: "msg assistant" });
  wrap.innerHTML = `<div class="msg-row"><div class="msg-gutter">⏺</div><div class="msg-body"></div></div>`;
  wrap.querySelector(".msg-body").append(card);
  addRaw(wrap);
  return {
    card,
    setStatus(st, label) {
      card.classList.remove("running", "ok", "fail", "denied");
      card.classList.add(st);
      card.querySelector(".tool-status").textContent = label || st;
    },
    setBody(text) {
      card.querySelector(".tool-card-body").textContent = text;
    },
    resultLine(text) {
      const p = el("div", { class: "tool-result-line", text });
      wrap.querySelector(".msg-body").append(p);
    },
  };
}

export default {
  addMessage, addUser, addAssistant, addSystem, addError, addRaw, addHtml,
  addCode, addDiff, clearMessages, makeToolCard, scrollToBottom,
};
