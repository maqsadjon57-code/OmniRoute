/* Anthropic Messages API — streaming + tools */

import { Keys } from "./keys.js";
import { findModel, DEFAULT_MODEL } from "./models.js";
import { Settings } from "./settings.js";
import { fs } from "./files.js";
import { Tools } from "./tools.js";
import { addMessage, addError, addSystem, scrollToBottom } from "./output.js";
import { renderMarkdown } from "./markdown.js";
import { hydrateMarkdownCode } from "./codeblock.js";
import { Conversation } from "./history.js";
import { Notify } from "./notifications.js";
import { StatusBar } from "./statusbar.js";
import { BRAILLE, randomPhrase } from "./utils.js";

const TOOL_DEFS = [
  {
    name: "read_file",
    description: "Read a file from the virtual workspace. Paths are absolute (e.g. /project/src/app.js) or relative to cwd.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string", description: "File path" } },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Create or overwrite a file in the virtual workspace.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string", description: "Full file contents" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "edit_file",
    description: "Replace a unique substring in a file.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
        old_text: { type: "string" },
        new_text: { type: "string" },
      },
      required: ["path", "old_text", "new_text"],
    },
  },
  {
    name: "delete_file",
    description: "Delete a file or directory from the workspace.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    description: "List files in a directory.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string", description: "Directory path, default cwd" } },
    },
  },
  {
    name: "search_files",
    description: "Search file contents for a query string.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        glob: { type: "string", description: "Optional path glob" },
      },
      required: ["query"],
    },
  },
  {
    name: "execute",
    description: "Run a shell command in the simulated workspace shell (ls, cat, git, node, python, …).",
    input_schema: {
      type: "object",
      properties: { command: { type: "string" } },
      required: ["command"],
    },
  },
  {
    name: "git",
    description: "Run a git subcommand in the virtual worktree.",
    input_schema: {
      type: "object",
      properties: { args: { type: "string", description: "e.g. status, log, diff" } },
    },
  },
  {
    name: "web_search",
    description: "Search the web (simulated unless a live backend is wired).",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "web_fetch",
    description: "Fetch a URL and return text.",
    input_schema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
];

const session = [];
const MAX_TURNS = 12;

export function resetSession() {
  session.length = 0;
}

function systemPrompt() {
  const model = findModel(Settings.get("model") || DEFAULT_MODEL);
  let tree = "";
  try { tree = fs.tree(fs.cwd, 3); } catch { tree = "(empty)"; }
  return `You are Claude Code, Anthropic's CLI coding agent, running inside a browser workspace called OmniRoute.
Current model: ${model.name} (${model.id})
Working directory: ${fs.cwd}

Virtual filesystem (truncated):
${tree}

Use tools to read, write, and edit files instead of only describing changes.
Be concise. Match the user's language. Prefer small, working patches.
The shell is simulated in-browser; commands like ls, cat, pwd, git, node, python work on the virtual FS.
If a tool fails, explain and try another approach.`;
}

function headers() {
  return {
    "content-type": "application/json",
    "x-api-key": Keys.get(),
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  };
}

export async function testKey(key = Keys.get()) {
  const base = Keys.base();
  const res = await fetch(base + "/v1/models", {
    method: "GET",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || res.statusText || "Key check failed";
    throw new Error(msg);
  }
  return body;
}

async function* parseSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const chunks = buf.split("\n\n");
    buf = chunks.pop() || "";
    for (const chunk of chunks) {
      let event = "message";
      const dataLines = [];
      for (const line of chunk.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
      }
      const raw = dataLines.join("\n");
      if (!raw || raw === "[DONE]") continue;
      try { yield { event, data: JSON.parse(raw) }; }
      catch { /* skip malformed */ }
    }
  }
}

function thinkingEl() {
  const el = document.createElement("div");
  el.className = "thinking";
  el.innerHTML = `<span class="spinner-braille">⠋</span><span class="thinking-phrase">${randomPhrase()}…</span>`;
  document.getElementById("messages").append(el);
  document.getElementById("thinking-bar")?.classList.add("on");
  StatusBar.setStatus("Thinking", "thinking");
  let i = 0;
  const t = setInterval(() => {
    const sp = el.querySelector(".spinner-braille");
    if (sp) sp.textContent = BRAILLE[i++ % BRAILLE.length];
  }, 80);
  return {
    el,
    set(text) {
      el.style.display = "flex";
      const p = el.querySelector(".thinking-phrase");
      if (p) p.textContent = text;
      document.getElementById("thinking-bar")?.classList.add("on");
    },
    hide() {
      el.style.display = "none";
      document.getElementById("thinking-bar")?.classList.remove("on");
    },
    stop() {
      clearInterval(t);
      el.remove();
      document.getElementById("thinking-bar")?.classList.remove("on");
      StatusBar.setStatus("Ready", "ready");
    },
  };
}

function flushBody(body, text) {
  hydrateMarkdownCode(renderMarkdown(text), body);
  scrollToBottom();
}

async function executeTool(name, input) {
  try {
    switch (name) {
      case "read_file": {
        const c = fs.read(input.path);
        await Tools.Read(input.path).catch(() => {});
        return c.slice(0, 80000);
      }
      case "write_file": {
        const r = await Tools.Write(input.path, input.content ?? "");
        return r ? `Wrote ${input.path}` : "Write denied or failed";
      }
      case "edit_file": {
        const r = await Tools.Edit(input.path, input.old_text, input.new_text);
        return r ? `Edited ${input.path}` : "Edit denied or failed";
      }
      case "delete_file": {
        const r = await Tools.Delete(input.path);
        return r ? `Deleted ${input.path}` : "Delete denied or failed";
      }
      case "list_files": {
        await Tools.List(input.path || fs.cwd);
        const items = fs.list(input.path || fs.cwd);
        return items.map((i) => (i.isDir ? i.name + "/" : i.name)).join("\n") || "(empty)";
      }
      case "search_files": {
        const hits = fs.search(input.query, { glob: input.glob });
        await Tools.Search(input.query, input.glob).catch(() => {});
        return hits.slice(0, 40).map((h) => `${h.path}:${h.line}: ${h.text}`).join("\n") || "No matches";
      }
      case "execute": {
        const r = await Tools.Execute(input.command);
        return r == null ? "Command denied" : "ok";
      }
      case "git": {
        const r = await Tools.Git(input.args || "status");
        return r == null ? "Git denied" : "ok";
      }
      case "web_search": {
        await Tools.WebSearch(input.query);
        return "Search completed (see tool card)";
      }
      case "web_fetch": {
        await Tools.WebFetch(input.url);
        return "Fetch completed (see tool card)";
      }
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Error: ${err.message || err}`;
  }
}

export async function chat(userText, signal) {
  if (!Keys.has()) throw new Error("No API key");
  const model = Settings.get("model") || DEFAULT_MODEL;
  session.push({ role: "user", content: userText });

  const think = thinkingEl();
  let lastText = "";

  try {
    for (let round = 0; round < MAX_TURNS; round++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const res = await fetch(Keys.base() + "/v1/messages", {
        method: "POST",
        headers: headers(),
        signal,
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          stream: true,
          system: systemPrompt(),
          tools: TOOL_DEFS,
          messages: session,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      let stopReason = "end_turn";
      let textAcc = "";
      const toolBlocks = [];
      let currentTool = null;
      let bodyEl = null;
      let started = false;

      think.set(randomPhrase() + "…");

      for await (const { event, data } of parseSSE(res)) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        if (event === "content_block_start") {
          if (data.content_block?.type === "tool_use") {
            currentTool = { id: data.content_block.id, name: data.content_block.name, json: "" };
          }
        } else if (event === "content_block_delta") {
          if (data.delta?.type === "text_delta") {
            if (!started) {
              think.hide();
              started = true;
              const msg = addMessage({ role: "assistant", text: "", persist: false });
              bodyEl = msg.body;
              bodyEl.innerHTML = "";
            }
            textAcc += data.delta.text || "";
            if (bodyEl) flushBody(bodyEl, textAcc);
          } else if (data.delta?.type === "input_json_delta" && currentTool) {
            currentTool.json += data.delta.partial_json || "";
          }
        } else if (event === "content_block_stop") {
          if (currentTool) {
            let input = {};
            try { input = currentTool.json ? JSON.parse(currentTool.json) : {}; } catch { input = {}; }
            toolBlocks.push({ type: "tool_use", id: currentTool.id, name: currentTool.name, input });
            currentTool = null;
          }
        } else if (event === "message_delta") {
          stopReason = data.delta?.stop_reason || stopReason;
        }
      }

      const assistantContent = [];
      if (textAcc) assistantContent.push({ type: "text", text: textAcc });
      for (const t of toolBlocks) assistantContent.push(t);
      if (!assistantContent.length) assistantContent.push({ type: "text", text: textAcc || "" });
      session.push({ role: "assistant", content: assistantContent });

      if (textAcc) {
        lastText = textAcc;
        Conversation.add({ role: "assistant", text: textAcc });
      }

      if (stopReason !== "tool_use" || !toolBlocks.length) {
        if (!started && textAcc) {
          addMessage({ role: "assistant", text: textAcc });
        }
        break;
      }

      think.set("Using tools…");
      document.getElementById("thinking-bar")?.classList.add("on");
      StatusBar.setStatus("Tools", "busy");

      const results = [];
      for (const t of toolBlocks) {
        const out = await executeTool(t.name, t.input || {});
        results.push({
          type: "tool_result",
          tool_use_id: t.id,
          content: String(out).slice(0, 40000),
        });
      }
      session.push({ role: "user", content: results });
    }
  } catch (err) {
    think.stop();
    if (err.name === "AbortError") {
      addSystem("Cancelled.");
      return;
    }
    const hint = /Failed to fetch|NetworkError|CORS/i.test(err.message)
      ? " The browser may be blocking the request. The client sends `anthropic-dangerous-direct-browser-access`. Check the key at console.anthropic.com, or set a CORS proxy as the API base URL."
      : "";
    addError((err.message || String(err)) + hint);
    Notify.error("Claude API", err.message || "Request failed");
    throw err;
  } finally {
    think.stop();
    StatusBar.setStatus("Ready", "ready");
  }
  return lastText;
}

export const Claude = { chat, testKey, resetSession, TOOL_DEFS };
export default Claude;
