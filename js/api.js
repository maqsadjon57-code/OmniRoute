/* Local agent + optional remote endpoint */

import { sleep, parseArgs, basename, extOf, langFromExt, countLines, fmtBytes, BRAILLE, randomPhrase } from "./utils.js";
import { fs } from "./files.js";
import { Tools, TOOLS, runShell } from "./tools.js";
import { addUser, addSystem, addError, addMessage, addAssistant, clearMessages } from "./output.js";
import { streamText } from "./streaming.js";
import { History, Conversation } from "./history.js";
import { Settings } from "./settings.js";
import { Theme } from "./theme.js";
import { Notify } from "./notifications.js";
import { StatusBar } from "./statusbar.js";
import { Permissions } from "./permissions.js";
import { COMMANDS } from "./autocomplete.js";
import { download } from "./utils.js";
import { Input } from "./input.js";
import { bus } from "./utils.js";
import { Keys } from "./keys.js";
import { Claude, resetSession } from "./claude.js";
import { MODELS, findModel, DEFAULT_MODEL, shortName } from "./models.js";

let abort = null;
let busy = false;

export function isBusy() { return busy; }

export function cancel() {
  if (abort) abort.abort();
  abort = null;
  busy = false;
  StatusBar.setStatus("Ready", "ready");
  document.getElementById("thinking-bar")?.classList.remove("on");
  Input.setDisabled(false);
  Notify.warning("Cancelled", "The current run was interrupted.");
}

function thinkingOn(phrase) {
  StatusBar.setStatus(phrase || "Thinking", "thinking");
  document.getElementById("thinking-bar")?.classList.add("on");
}

function thinkingOff() {
  StatusBar.setStatus("Ready", "ready");
  document.getElementById("thinking-bar")?.classList.remove("on");
}

async function withThinking(fn) {
  busy = true;
  Input.setDisabled(true);
  abort = new AbortController();
  const thinkEl = document.createElement("div");
  thinkEl.className = "thinking";
  thinkEl.innerHTML = `<span class="spinner-braille">⠋</span><span class="thinking-phrase">${randomPhrase()}…</span>`;
  document.getElementById("messages").append(thinkEl);
  thinkingOn(randomPhrase());
  let i = 0;
  const spin = setInterval(() => {
    const sp = thinkEl.querySelector(".spinner-braille");
    if (sp) sp.textContent = BRAILLE[i++ % BRAILLE.length];
  }, 80);
  try {
    await sleep(220);
    await fn(abort.signal, thinkEl);
  } finally {
    clearInterval(spin);
    thinkEl.remove();
    thinkingOff();
    busy = false;
    abort = null;
    Input.setDisabled(false);
    Input.focus();
  }
}

async function reply(text, signal) {
  const { body } = addMessage({ role: "assistant", text: "", persist: false });
  body.innerHTML = "";
  await streamText(body, text, { signal });
}

/* -------------------- slash commands -------------------- */

async function handleSlash(raw, signal) {
  const trimmed = raw.trim();
  const space = trimmed.indexOf(" ");
  const cmd = (space < 0 ? trimmed : trimmed.slice(0, space)).toLowerCase();
  const arg = space < 0 ? "" : trimmed.slice(space + 1);

  switch (cmd) {
    case "/help":
      await reply(helpText(), signal);
      return;
    case "/clear":
      bus.emit("cmd:clear");
      return;
    case "/reset":
    case "/new":
      Conversation.clear();
      resetSession();
      bus.emit("cmd:welcome");
      Notify.info("Conversation reset");
      return;
    case "/model": {
      const argm = arg.trim();
      if (!argm) {
        const cur = findModel(Settings.get("model") || DEFAULT_MODEL);
        const list = MODELS.map((m) => `- ${m.id === cur.id ? "**" : ""}${m.icon} ${m.name}${m.tag ? ` (${m.tag})` : ""}${m.id === cur.id ? "** ←" : ""} — \`${m.id}\``).join("\n");
        await reply(`Current model: **${cur.name}** (\`${cur.id}\`)\n\n${list}\n\nUsage: \`/model sonnet\` or \`/model claude-opus-5\``, signal);
        return;
      }
      const q = argm.toLowerCase();
      const hit = MODELS.find((m) => m.id === argm || m.id.toLowerCase() === q || m.name.toLowerCase() === q || m.family.toLowerCase() === q || m.name.toLowerCase().includes(q));
      const id = hit ? hit.id : argm;
      Settings.set("model", id);
      bus.emit("model:change", id);
      await reply(`Model set to **${shortName(id)}** (\`${id}\`).`, signal);
      return;
    }
    case "/apikey":
    case "/key":
      if (arg.trim() && !["clear", "test"].includes(arg.trim().toLowerCase())) {
        Keys.set(arg.trim());
        await reply(`API key saved as \`${Keys.masked()}\`.`, signal);
        return;
      }
      if (arg.trim().toLowerCase() === "clear") {
        Keys.clear();
        await reply("API key cleared. Local demo agent is active.", signal);
        return;
      }
      bus.emit("ui:apikey");
      return;
    case "/history": {
      const items = History.list(30);
      await reply(items.length ? items.map((c, i) => `${String(i + 1).padStart(3)}  ${c}`).join("\n") : "History is empty.", signal);
      return;
    }
    case "/settings":
      bus.emit("ui:settings");
      return;
    case "/theme": {
      const name = arg.trim() || Theme.cycle();
      if (arg.trim()) Theme.set(arg.trim());
      await reply(`Theme is now **${Theme.current()}**.`, signal);
      return;
    }
    case "/tools":
      await reply(toolsText(), signal);
      return;
    case "/files":
    case "/ls":
      await Tools.List(arg || fs.cwd);
      return;
    case "/tree":
      await reply("```\n" + fs.tree(arg || fs.cwd) + "\n```", signal);
      return;
    case "/search":
      if (!arg) return reply("Usage: `/search <query>`", signal);
      await Tools.Search(arg);
      return;
    case "/execute":
    case "/exec":
    case "/run":
    case "/sh":
      if (!arg) return reply("Usage: `/execute <command>`", signal);
      await Tools.Execute(arg);
      return;
    case "/read":
      if (!arg) return reply("Usage: `/read <path>`", signal);
      await Tools.Read(arg);
      return;
    case "/write": {
      const nl = arg.indexOf("\n");
      const first = nl < 0 ? arg : arg.slice(0, nl);
      const body = nl < 0 ? "" : arg.slice(nl + 1);
      const [path, ...rest] = parseArgs(first);
      if (!path) return reply("Usage: `/write <path>` then contents on following lines.", signal);
      await Tools.Write(path, body || rest.join(" "));
      return;
    }
    case "/edit":
      return reply("Usage from chat: describe the edit, e.g. *in src/app.js change greet to use a default name*.\nOr: `/edit path <<<old>>> <<<new>>>`", signal);
    case "/delete":
    case "/rm":
      if (!arg) return reply("Usage: `/delete <path>`", signal);
      await Tools.Delete(arg);
      return;
    case "/git":
      await Tools.Git(arg || "status");
      return;
    case "/export": {
      const kind = arg.trim() || "md";
      if (kind === "json") download("conversation.json", Conversation.exportJSON(), "application/json");
      else download("conversation.md", Conversation.exportMarkdown(), "text/markdown");
      Notify.success("Exported", "conversation." + (kind === "json" ? "json" : "md"));
      return;
    }
    case "/import":
      bus.emit("ui:import");
      return;
    case "/shortcuts":
      bus.emit("ui:shortcuts");
      return;
    case "/status":
      await reply(statusText(), signal);
      return;
    case "/version":
      await reply("**Claude Code Web** v1.0.0  ·  OmniRoute\nBrowser agent with a virtual workspace. Not affiliated with Anthropic.", signal);
      return;
    case "/sidebar":
      bus.emit("ui:sidebar");
      return;
    case "/cwd":
    case "/cd":
      if (arg) {
        try { fs.cd(arg); StatusBar.setCwd(fs.cwd); await reply("cwd: `" + fs.cwd + "`", signal); }
        catch (e) { addError(e.message); }
      } else await reply("cwd: `" + fs.cwd + "`", signal);
      return;
    case "/save":
      fs.persist();
      StatusBar.setSaved(true);
      Notify.success("Workspace saved");
      return;
    case "/exit":
      bus.emit("ui:min");
      return;
    case "/browser":
      if (!arg) return reply("Usage: `/browser <url>`", signal);
      await Tools.Browser(arg.startsWith("http") ? arg : "https://" + arg);
      return;
    case "/web":
    case "/websearch":
      if (!arg) return reply("Usage: `/web <query>`", signal);
      await Tools.WebSearch(arg);
      await reply(`I searched for **${arg}** (simulated results above). In a connected runtime this would use a live search API.`, signal);
      return;
    case "/fetch":
    case "/webfetch":
      if (!arg) return reply("Usage: `/fetch <url>`", signal);
      await Tools.WebFetch(arg);
      return;
    default:
      await reply(`Unknown command \`${cmd}\`. Type \`/help\` for the list.`, signal);
  }
}

function helpText() {
  const rows = COMMANDS.map((c) => `| \`${c.cmd}\` | ${c.desc} |`).join("\n");
  return `**Claude Code Web — commands**

Type a prompt in natural language, or a slash command.

| Command | Description |
|---------|-------------|
${rows}

**Tips**
- \`Shift+Enter\` newline · \`Tab\` autocomplete · \`↑↓\` history
- \`Ctrl+Shift+P\` command palette · \`Ctrl+L\` clear
- **API Key** button (or \`/apikey\`) to talk to live Claude · \`/model\` to switch Opus / Sonnet / Haiku
- Ask me to *create*, *read*, *edit*, or *run* files in the virtual workspace.
`;
}

function toolsText() {
  const rows = TOOLS.map((t) => `| ${t.icon} **${t.name}** | ${t.desc} | \`${t.kbd}\` |`).join("\n");
  return `**Built-in tools**

| Tool | Description | Shortcut |
|------|-------------|----------|
${rows}

Tools run against the in-browser filesystem at \`${fs.cwd}\`. Dangerous commands open a permission dialog.
`;
}

function statusText() {
  const sb = StatusBar.get();
  const model = findModel(Settings.get("model") || DEFAULT_MODEL);
  return `**Session**
- Status: ${sb.status}
- Model: **${model.name}** (\`${model.id}\`)
- API key: ${Keys.has() ? Keys.masked() + " · live Claude" : "not set · local demo agent"}
- cwd: \`${fs.cwd}\`
- Files: ${fs.summary()}
- Theme: ${Settings.get("theme")}
- Streaming: ${Settings.get("streaming") ? "on" : "off"}
- Tools: ${TOOLS.length}
- History: ${History.items.length} commands
- Conversation: ${Conversation.messages.length} messages
- Encoding: UTF-8
`;
}

/* -------------------- natural language agent -------------------- */

function detectIntent(text) {
  const t = text.trim();
  const lower = t.toLowerCase();

  const fileish = t.match(/(?:file\s+)?([./\w-]+\.[a-z0-9]{1,8})/i);
  const path = fileish ? fileish[1] : null;

  if (/^(ls|pwd|whoami|date|uname)\b/.test(lower) || /^(git\s+\w+)/.test(lower))
    return { type: "shell", command: t };

  if (/\b(list files|show files|what's in|ls\b|directory tree|show tree)\b/i.test(t))
    return { type: "list" };

  if (/\b(read|open|show|cat|contents of)\b/i.test(t) && path)
    return { type: "read", path };

  if (/\b(delete|remove|rm)\b/i.test(t) && path)
    return { type: "delete", path };

  if (/\b(search|find|grep)\b/i.test(t)) {
    const q = t.replace(/^(please\s+)?(search|find|grep)\s+(for\s+)?/i, "").trim();
    return { type: "search", query: q };
  }

  if (/\b(run|execute|exec)\b/i.test(t)) {
    const m = t.match(/(?:run|execute|exec)\s+`?(.+?)`?$/i);
    return { type: "shell", command: m ? m[1] : t };
  }

  if (/\b(git)\b/i.test(lower))
    return { type: "git", args: t.replace(/^.*\bgit\b/i, "").trim() || "status" };

  if (/\b(search the web|google|look up online)\b/i.test(t))
    return { type: "web", query: t.replace(/.*(?:search the web for|google|look up online)\s*/i, "") };

  if (/\b(create|write|make|add|generate|scaffold)\b/i.test(t))
    return { type: "create", text: t, path };

  if (/\b(edit|change|update|modify|fix|replace|rename)\b/i.test(t) && (path || /file/i.test(t)))
    return { type: "edit", text: t, path };

  if (/\b(help|shortcuts|what can you do)\b/i.test(lower) && t.length < 40)
    return { type: "help" };

  return { type: "chat", text: t };
}

function generateFile(intent) {
  const t = intent.text;
  const lower = t.toLowerCase();
  let path = intent.path;
  let content = "";
  let lang = "text";

  if (!path) {
    if (/python|\.py|flask|django/i.test(t)) path = "/project/src/main.py";
    else if (/html|landing|page/i.test(t)) path = "/project/src/index.html";
    else if (/css|stylesheet/i.test(t)) path = "/project/src/styles.css";
    else if (/json/i.test(t)) path = "/project/config.json";
    else if (/readme/i.test(t)) path = "/project/README.md";
    else if (/typescript|\.ts/i.test(t)) path = "/project/src/index.ts";
    else path = "/project/src/app.js";
  } else if (!path.startsWith("/")) {
    path = fs.normalize(path);
  }

  lang = langFromExt(extOf(path));

  if (lang === "python") {
    const name = (t.match(/called\s+(\w+)/i) || [])[1] || "main";
    if (/flask/i.test(t)) {
      content = `from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def index():
    return jsonify({"ok": True, "msg": "Hello from Flask"})

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`;
    } else if (/hello/i.test(t)) {
      content = `#!/usr/bin/env python3
"""Simple hello-world entrypoint."""

def greet(name: str = "World") -> str:
    return f"Hello, {name}!"


def main() -> None:
    print(greet())


if __name__ == "__main__":
    main()
`;
    } else {
      content = `#!/usr/bin/env python3
"""Generated by Claude Code Web."""

from __future__ import annotations


def ${name}() -> None:
    print("Hello from ${name}()")


if __name__ == "__main__":
    ${name}()
`;
    }
  } else if (lang === "html") {
    content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OmniRoute</title>
  <style>
    :root { color-scheme: dark; --accent: #d97757; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #1a1a1a; color: #e8e8e8; }
    main { max-width: 720px; margin: 12vh auto; padding: 0 24px; }
    h1 { color: var(--accent); letter-spacing: -0.03em; }
    a { color: var(--accent); }
  </style>
</head>
<body>
  <main>
    <h1>OmniRoute</h1>
    <p>A Claude Code–style agent, running in your browser.</p>
    <p><a href="#">Get started →</a></p>
  </main>
</body>
</html>
`;
  } else if (lang === "css") {
    content = `:root {
  --bg: #1a1a1a;
  --fg: #e8e8e8;
  --accent: #d97757;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
}

.btn {
  background: var(--accent);
  color: #1a1a1a;
  border: 0;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
}
`;
  } else if (lang === "json") {
    content = JSON.stringify({ name: "omniroute", version: "1.0.0", generated: true }, null, 2) + "\n";
  } else if (lang === "markdown") {
    content = `# ${basename(path).replace(/\.md$/, "")}

Generated by Claude Code Web.

## Overview

Describe the project here.

## Usage

\`\`\`bash
/help
\`\`\`
`;
  } else {
    const fn = (t.match(/function\s+(\w+)/i) || t.match(/called\s+(\w+)/i) || [])[1] || "main";
    content = `/**
 * ${basename(path)} — generated by Claude Code Web
 */

function ${fn}() {
  console.log("Hello, World!");
}

function greet(name = "world") {
  return \`Hello, \${name}!\`;
}

if (typeof require !== "undefined" && require.main === module) {
  ${fn}();
}

module.exports = { ${fn}, greet };
`;
  }

  return { path, content, lang };
}

function chatReply(text) {
  const lower = text.toLowerCase();
  if (/who are you|what are you/.test(lower)) {
    return "I'm **Claude Code Web** — a browser recreation of the Claude Code terminal agent.\n\nI can read and write files in a virtual workspace, run a simulated shell, show diffs, and walk you through coding tasks. Type `/help` or just tell me what to build.";
  }
  if (/hello|hi\b|hey\b/.test(lower) && text.length < 40) {
    return "Hey. What would you like to work on? I can scaffold files, inspect the project, or run commands in the virtual shell.";
  }
  if (/thank/.test(lower) && text.length < 40) {
    return "Anytime. I'm here when you want to keep going.";
  }

  // generic coding-oriented reply with a snippet if they asked a question
  if (/\?$/.test(text) || /how (do|can|to)|what is|explain/i.test(text)) {
    return answerQuestion(text);
  }

  return `I can take that as a coding task. A few ways to proceed:

- **Create a file** — e.g. *create a python hello world*
- **Inspect the repo** — \`/files\` or \`/tree\`
- **Run something** — \`/execute ls -l\`
- **Search** — \`/search greet\`

Or describe the change you want in \`/project\` and I'll use the Write / Edit tools.

> ${text.replace(/\n/g, " ").slice(0, 240)}
`;
}

function answerQuestion(q) {
  const lower = q.toLowerCase();
  if (/debounce/.test(lower)) {
    return `A **debounce** delays a function until activity stops. Useful for search boxes.

\`\`\`javascript
function debounce(fn, ms = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
\`\`\`

Want me to add this to \`src/utils.js\`?`;
  }
  if (/closure/.test(lower)) {
    return `A **closure** is a function that remembers the lexical scope in which it was created, even after that scope has finished.

\`\`\`javascript
function counter(start = 0) {
  let n = start;
  return () => ++n;
}
const next = counter();
next(); // 1
next(); // 2
\`\`\``;
  }
  if (/async|promise|await/.test(lower)) {
    return `Use \`async/await\` for sequential async work, and \`Promise.all\` when tasks are independent.

\`\`\`javascript
async function load() {
  const [user, repo] = await Promise.all([
    fetch("/api/user").then(r => r.json()),
    fetch("/api/repo").then(r => r.json()),
  ]);
  return { user, repo };
}
\`\`\``;
  }
  if (/regex|regular expression/.test(lower)) {
    return `JavaScript regex cheatsheet:

| Pattern | Meaning |
|---------|---------|
| \`\\\\d\` | digit |
| \`\\\\w\` | word char |
| \`+\` | one or more |
| \`?\` | optional |
| \`(foo|bar)\` | group / or |

\`\`\`javascript
const ok = /^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i.test("a@b.com");
\`\`\``;
  }
  if (/python/.test(lower)) {
    return `Python snippet matching your question:

\`\`\`python
from pathlib import Path

def read_text(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")
\`\`\`

I can drop a full module into \`/project/src\` if you want.`;
  }
  return `Here's a concise take:

**${q.trim()}**

I don't have a live model connection in this demo build, so I'll reason locally:

1. Restate the goal in one sentence.
2. Pick the smallest file in \`/project\` that should change.
3. Apply it with **Write** / **Edit**.
4. Verify with \`/execute\` (simulated shell).

Tell me the target file (or ask me to create one) and I'll do the work. You can also type \`/tools\` to see everything I can call.`;
}

export async function submit(text) {
  if (busy) {
    Notify.warning("Busy", "Wait for the current run, or press Ctrl+C to cancel.");
    return;
  }
  text = String(text).replace(/\s+$/, "");
  if (!text) return;
  addUser(text);

  if (!text.startsWith("/") && Keys.has()) {
    busy = true;
    Input.setDisabled(true);
    abort = new AbortController();
    try {
      await Claude.chat(text, abort.signal);
    } catch {
      /* rendered in Claude.chat */
    } finally {
      busy = false;
      abort = null;
      Input.setDisabled(false);
      Input.focus();
    }
    return;
  }

  await withThinking(async (signal) => {
    if (text.startsWith("/")) {
      await handleSlash(text, signal);
      return;
    }
    const intent = detectIntent(text);

    if (intent.type === "help") { await handleSlash("/help", signal); return; }
    if (intent.type === "list") { await Tools.List(fs.cwd); await reply("Contents of `" + fs.cwd + "`. Use `/tree` for a deeper view.", signal); return; }
    if (intent.type === "read") {
      try { await Tools.Read(intent.path); }
      catch (e) { addError(e.message); }
      return;
    }
    if (intent.type === "delete") { await Tools.Delete(intent.path); return; }
    if (intent.type === "search") { await Tools.Search(intent.query); return; }
    if (intent.type === "shell") { await Tools.Execute(intent.command); return; }
    if (intent.type === "git") { await Tools.Git(intent.args); return; }
    if (intent.type === "web") { await Tools.WebSearch(intent.query); return; }

    if (intent.type === "create") {
      const gen = generateFile(intent);
      await reply(`I'll add \`${gen.path}\` with a ${gen.lang} starter.`, signal);
      await Tools.Write(gen.path, gen.content);
      await reply(`Created **${gen.path}** (${countLines(gen.content)} lines, ${fmtBytes(gen.content.length)}).\n\nOpen it anytime with \`/read ${gen.path}\`.`, signal);
      return;
    }

    if (intent.type === "edit") {
      const path = intent.path ? fs.normalize(intent.path) : null;
      if (!path || !fs.isFile(path)) {
        await reply("Tell me which file to edit, for example: *edit src/utils.js and add a clamp function*.", signal);
        return;
      }
      const src = fs.read(path);
      // heuristic patches
      let next = src;
      if (/clamp/i.test(intent.text) && !/function clamp/.test(src)) {
        next = src.replace(/module\.exports = \{([^}]+)\}/, (m, inner) => {
          const fn = `\nfunction clamp(n, min, max) {\n  return Math.max(min, Math.min(max, n));\n}\n`;
          if (src.includes("function clamp")) return m;
          return fn + `module.exports = {${inner}, clamp}`;
        });
        if (next === src) next = src + `\nfunction clamp(n, min, max) {\n  return Math.max(min, Math.min(max, n));\n}\n`;
      } else if (/hello/i.test(intent.text) && /World/.test(src)) {
        next = src.replace("World", "Claude");
      } else {
        next = src.replace(/console\.log\(([^)]*)\)/, 'console.log("[omniroute]", $1)');
        if (next === src) next = src + `\n// ${intent.text.slice(0, 80)}\n`;
      }
      if (next === src) {
        await reply("I couldn't find a safe automatic patch. Try `/read " + path + "` and describe the exact change.", signal);
        return;
      }
      const oldSnippet = src.slice(0, 40);
      // Use Tools.Edit with a unique needle
      const permOk = true;
      await Tools.Write(path, next); // write shows diff-ish via code; Edit needs exact needle
      await reply(`Updated \`${path}\`. Review the file and tweak if needed.`, signal);
      return;
    }

    await reply(chatReply(text), signal);
  });
}

export const API = { submit, cancel, isBusy, handleSlash };
export default API;
