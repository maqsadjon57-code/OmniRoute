/* Built-in agent tools operating on the virtual FS + simulated shell */

import { basename, extOf, fmtBytes, countLines, isDangerous, parseArgs, joinPath, sleep, langFromExt } from "./utils.js";
import { fs } from "./files.js";
import { Permissions } from "./permissions.js";
import { makeToolCard, addCode, addDiff, addSystem } from "./output.js";
import { Notify } from "./notifications.js";
import { StatusBar } from "./statusbar.js";

export const TOOLS = [
  { name: "Read", desc: "Read files", icon: "📄", slash: "/read ", kbd: "Ctrl+Shift+R" },
  { name: "Write", desc: "Create files", icon: "📝", slash: "/write ", kbd: "Ctrl+Shift+W" },
  { name: "Edit", desc: "Edit files", icon: "✏️", slash: "/edit ", kbd: "Ctrl+Shift+E" },
  { name: "Delete", desc: "Delete files", icon: "🗑", slash: "/delete ", kbd: "Ctrl+Shift+D" },
  { name: "Search", desc: "Search contents", icon: "🔍", slash: "/search ", kbd: "Ctrl+Shift+S" },
  { name: "List", desc: "List files", icon: "📁", slash: "/files", kbd: "Ctrl+Shift+L" },
  { name: "Execute", desc: "Run a command", icon: "⚡", slash: "/execute ", kbd: "Ctrl+Shift+X" },
  { name: "Browser", desc: "Open a URL", icon: "🌐", slash: "/browser ", kbd: "Ctrl+Alt+B" },
  { name: "WebSearch", desc: "Search the web", icon: "🔎", slash: "/web ", kbd: "Ctrl+Alt+F" },
  { name: "WebFetch", desc: "Fetch a page", icon: "📥", slash: "/fetch ", kbd: "Ctrl+Shift+G" },
  { name: "Terminal", desc: "Interactive shell", icon: "💻", slash: "/execute ", kbd: "Ctrl+Shift+`" },
  { name: "Git", desc: "Git operations", icon: "🔀", slash: "/git ", kbd: "Ctrl+Shift+U" },
];

async function withCard(name, arg, icon, fn) {
  const card = makeToolCard({ name, arg, icon });
  StatusBar.setStatus(name, "busy");
  try {
    const res = await fn(card);
    card.setStatus("ok", "done");
    if (typeof res === "string") card.resultLine(res);
    StatusBar.setStatus("Ready", "ready");
    return res;
  } catch (err) {
    card.setStatus("fail", "error");
    card.setBody(String(err.message || err));
    card.resultLine("Error: " + (err.message || err));
    StatusBar.setStatus("Error", "error");
    throw err;
  }
}

export const Tools = {
  list() { return TOOLS; },

  async Read(path) {
    return withCard("Read", path, "📄", async (card) => {
      const content = fs.read(path);
      const st = fs.stat(path);
      card.setBody(content.slice(0, 4000) + (content.length > 4000 ? "\n…" : ""));
      addCode(content, { lang: langFromExt(st.ext), filename: basename(path) });
      return `Read ${st.lines} lines (${fmtBytes(st.size)})`;
    });
  },

  async Write(path, content) {
    const perm = await Permissions.request({
      tool: "Write",
      title: "write a file",
      command: `write ${path}`,
      cwd: fs.cwd,
      detail: `${countLines(content)} lines`,
    });
    if (perm === "deny" || perm === "never") {
      addSystem("Write denied.");
      return null;
    }
    return withCard("Write", path, "📝", async (card) => {
      const r = fs.write(path, content);
      card.setBody(content.slice(0, 2000));
      addCode(content, { lang: langFromExt(extOf(path)), filename: basename(path) });
      Notify.success("File written", path);
      StatusBar.setSaved(true);
      return `Wrote ${r.lines} lines · ${fmtBytes(r.bytes)}`;
    });
  },

  async Edit(path, oldText, newText) {
    const perm = await Permissions.request({
      tool: "Edit",
      title: "edit a file",
      command: `edit ${path}`,
      cwd: fs.cwd,
    });
    if (perm === "deny" || perm === "never") return null;
    return withCard("Edit", path, "✏️", async (card) => {
      const { before, after } = fs.edit(path, oldText, newText);
      card.setBody(`- ${oldText.slice(0, 200)}\n+ ${newText.slice(0, 200)}`);
      addDiff(path, before, after);
      Notify.success("File edited", path);
      return `Updated ${path}`;
    });
  },

  async Delete(path) {
    const perm = await Permissions.request({
      tool: "Delete",
      title: "delete a file",
      command: `rm ${path}`,
      cwd: fs.cwd,
      dangerous: true,
    });
    if (perm === "deny" || perm === "never") return null;
    return withCard("Delete", path, "🗑", async (card) => {
      const { removed } = fs.remove(path);
      card.setBody(removed.join("\n"));
      Notify.warning("Deleted", removed.join(", "));
      return `Removed ${removed.length} path(s)`;
    });
  },

  async Search(query, glob) {
    return withCard("Search", query, "🔍", async (card) => {
      const hits = fs.search(query, { glob });
      const text = hits.slice(0, 50).map((h) => `${h.path}:${h.line}: ${h.text.trim()}`).join("\n") || "No matches";
      card.setBody(text);
      card.card.classList.add("open");
      return `${hits.length} match(es)`;
    });
  },

  async List(path) {
    return withCard("List", path || fs.cwd, "📁", async (card) => {
      const items = fs.list(path || fs.cwd);
      const text = items.map((it) => `${it.isDir ? "📁" : "📄"} ${it.name}${it.isDir ? "/" : ""}`).join("\n");
      card.setBody(text || "(empty)");
      card.card.classList.add("open");
      return `${items.length} entries`;
    });
  },

  async Execute(command) {
    const dangerous = isDangerous(command);
    const perm = await Permissions.request({
      tool: "Execute",
      title: "execute a command",
      command,
      cwd: fs.cwd,
      dangerous,
    });
    if (perm === "deny" || perm === "never") {
      addSystem("Command denied.");
      return null;
    }
    return withCard("Execute", command, "⚡", async (card) => {
      await sleep(180);
      const out = runShell(command);
      card.setBody(out);
      card.card.classList.add("open");
      return `exit 0`;
    });
  },

  async Browser(url) {
    return withCard("Browser", url, "🌐", async (card) => {
      card.setBody(`Opening ${url} in a new tab (sandbox-safe).`);
      try { window.open(url, "_blank", "noopener"); } catch { /* ignore */ }
      return `Opened ${url}`;
    });
  },

  async WebSearch(query) {
    return withCard("WebSearch", query, "🔎", async (card) => {
      await sleep(250);
      const fake = mockSearch(query);
      card.setBody(fake);
      card.card.classList.add("open");
      return `3 results (simulated — no live network)`;
    });
  },

  async WebFetch(url) {
    return withCard("WebFetch", url, "📥", async (card) => {
      let text = "";
      try {
        const res = await fetch(url, { mode: "cors" });
        text = await res.text();
        text = text.slice(0, 4000);
      } catch (e) {
        text = `Could not fetch ${url} (CORS or offline).\n${e.message}\n\nSimulated summary: resource at ${url} would be retrieved in a full agent runtime.`;
      }
      card.setBody(text);
      card.card.classList.add("open");
      return `Fetched ${fmtBytes(text.length)}`;
    });
  },

  async Terminal(command) {
    return this.Execute(command);
  },

  async Git(args) {
    const cmdline = "git " + (Array.isArray(args) ? args.join(" ") : args || "status");
    const perm = await Permissions.request({
      tool: "Git",
      title: "run a git command",
      command: cmdline,
      cwd: fs.cwd,
    });
    if (perm === "deny" || perm === "never") return null;
    return withCard("Git", cmdline, "🔀", async (card) => {
      const out = runGit(Array.isArray(args) ? args : parseArgs(String(args || "status")));
      card.setBody(out);
      card.card.classList.add("open");
      return "git done";
    });
  },
};

/* ---------- simulated shell ---------- */

let gitLog = [
  { hash: "f3805f7", msg: "Initial commit", author: "developer" },
];
let branch = "arena/01a0756b-omniroute";

export function runShell(command) {
  const raw = String(command).trim();
  if (!raw) return "";
  const [cmd, ...rest] = parseArgs(raw);
  const arg = rest.join(" ");

  switch (cmd) {
    case "pwd":
      return fs.cwd;
    case "ls": {
      const long = rest.includes("-l") || rest.includes("-la") || rest.includes("-al");
      const target = rest.find((a) => !a.startsWith("-")) || fs.cwd;
      const items = fs.list(target);
      if (!long) return items.map((i) => i.name + (i.isDir ? "/" : "")).join("  ");
      return items.map((i) => `${i.isDir ? "drwxr-xr-x" : "-rw-r--r--"}  1 user  staff  ${String(i.size).padStart(6)}  ${i.name}`).join("\n");
    }
    case "cd": {
      try { return fs.cd(arg || "/project"); }
      catch (e) { return `cd: ${e.message}`; }
    }
    case "cat": {
      try { return rest.map((p) => fs.read(p)).join("\n"); }
      catch (e) { return `cat: ${e.message}`; }
    }
    case "echo":
      return rest.join(" ").replace(/^["']|["']$/g, "");
    case "mkdir": {
      rest.filter((a) => !a.startsWith("-")).forEach((p) => fs.mkdir(p));
      return "";
    }
    case "touch": {
      rest.forEach((p) => { if (!fs.exists(p)) fs.write(p, ""); });
      return "";
    }
    case "rm": {
      const force = rest.includes("-rf") || rest.includes("-fr") || rest.includes("-r");
      const paths = rest.filter((a) => !a.startsWith("-"));
      const out = [];
      for (const p of paths) {
        try { fs.remove(p); } catch (e) { out.push(`rm: ${e.message}`); }
      }
      return out.join("\n");
    }
    case "head": {
      const n = parseInt((rest.find((a) => a.startsWith("-")) || "-10").replace("-n", "").replace("-", ""), 10) || 10;
      const file = rest.find((a) => !a.startsWith("-"));
      try { return fs.read(file).split("\n").slice(0, n).join("\n"); }
      catch (e) { return String(e.message); }
    }
    case "tail": {
      const file = rest.find((a) => !a.startsWith("-"));
      try { return fs.read(file).split("\n").slice(-10).join("\n"); }
      catch (e) { return String(e.message); }
    }
    case "wc": {
      const file = rest.find((a) => !a.startsWith("-"));
      try {
        const c = fs.read(file);
        const lines = countLines(c);
        const words = c.trim() ? c.trim().split(/\s+/).length : 0;
        return `${lines} ${words} ${c.length} ${file}`;
      } catch (e) { return String(e.message); }
    }
    case "find": {
      const q = rest[0] || fs.cwd;
      return fs.allFiles().filter((p) => p.startsWith(fs.normalize(q)) || q === ".").join("\n");
    }
    case "grep": {
      const q = rest.filter((a) => !a.startsWith("-"))[0];
      if (!q) return "usage: grep PATTERN";
      return fs.search(q).map((h) => `${h.path}:${h.line}:${h.text}`).join("\n") || "";
    }
    case "tree":
      return fs.tree(arg || fs.cwd);
    case "whoami":
      return "developer";
    case "date":
      return new Date().toString();
    case "uname":
      return "ClaudeCodeWeb 1.0.0 browser x86_64";
    case "env":
      return `PWD=${fs.cwd}\nHOME=/project\nUSER=developer\nTERM=xterm-256color\nLANG=en_US.UTF-8`;
    case "clear":
      return "__CLEAR__";
    case "git":
      return runGit(rest);
    case "node":
    case "python":
    case "python3": {
      const file = rest.find((a) => !a.startsWith("-"));
      if (!file) return `${cmd}: interactive REPL is not available in the browser sandbox.`;
      try {
        const src = fs.read(file);
        return simulateRun(src, cmd);
      } catch (e) { return String(e.message); }
    }
    case "npm":
      if (rest[0] === "test") return "> omniroute-demo@1.0.0 test\n> node src/app.js --test\n\nHello, world!\n2 + 3 = 5\n";
      if (rest[0] === "start") return "> omniroute-demo@1.0.0 start\nHello, world!\n2 + 3 = 5\n";
      return `npm ${rest.join(" ")} — simulated. Dependencies are not installed in the sandbox.`;
    case "which":
      return `/usr/bin/${rest[0] || ""}`;
    case "true":
      return "";
    case "false":
      return "exit 1";
    default:
      return `${cmd}: command not found\n(simulated shell — try ls, cat, pwd, echo, mkdir, touch, rm, grep, git, node, python)`;
  }
}

function simulateRun(src, runtime) {
  const prints = [];
  const re = runtime.startsWith("py")
    ? /print\((['"`])([\s\S]*?)\1\)/g
    : /console\.log\((['"`])([\s\S]*?)\1\)/g;
  let m;
  while ((m = re.exec(src))) prints.push(m[2]);
  if (!prints.length) {
    if (/Hello/.test(src)) prints.push("Hello, World!");
    else prints.push(`[${runtime}] ran ${countLines(src)} lines (no captured output)`);
  }
  return prints.join("\n");
}

export function runGit(args) {
  const sub = args[0] || "status";
  switch (sub) {
    case "status":
      return `On branch ${branch}\nYour branch is up to date with 'origin/${branch}'.\n\nnothing to commit, working tree clean`;
    case "log":
      return gitLog.map((c) => `commit ${c.hash}\nAuthor: ${c.author}\n    ${c.msg}`).join("\n\n");
    case "branch":
      return `* ${branch}\n  main`;
    case "diff":
      return "(no unstaged changes in the virtual worktree)";
    case "add":
      return `ok (${args.slice(1).join(" ") || "."})`;
    case "commit": {
      const msgIdx = args.findIndex((a) => a === "-m");
      const msg = msgIdx >= 0 ? args[msgIdx + 1] : "update";
      const hash = Math.random().toString(16).slice(2, 9);
      gitLog.unshift({ hash, msg, author: "developer" });
      return `[${branch} ${hash}] ${msg}`;
    }
    case "checkout":
    case "switch":
      if (args[1]) branch = args[1].replace(/^-b\s*/, "");
      return `Switched to branch '${branch}'`;
    case "init":
      return "Initialized empty Git repository in /project/.git/";
    case "remote":
      return "origin  https://github.com/maqsadjon57-code/OmniRoute.git";
    default:
      return `git ${args.join(" ")} — simulated in the browser worktree.`;
  }
}

function mockSearch(query) {
  return [
    `1. ${query} — MDN Web Docs`,
    `   https://developer.mozilla.org/search?q=${encodeURIComponent(query)}`,
    `   Documentation and guides related to “${query}”.`,
    ``,
    `2. ${query} — Stack Overflow`,
    `   https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
    `   Community answers and snippets.`,
    ``,
    `3. ${query} — GitHub Code Search`,
    `   https://github.com/search?q=${encodeURIComponent(query)}`,
    `   Open-source implementations.`,
  ].join("\n");
}

export default Tools;
