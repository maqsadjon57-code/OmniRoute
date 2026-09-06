/* In-browser virtual filesystem */

import { bus, joinPath, basename, dirname, extOf, storageGet, storageSet, fmtBytes, countLines } from "./utils.js";

const STORE_KEY = "ccweb.fs.v1";

const DEFAULT_TREE = {
  "/project/README.md": `# OmniRoute / Claude Code Web

Welcome to the in-browser Claude Code workspace.

## Quick start
- Type \`/help\` for commands
- Press \`Ctrl+Shift+P\` for the command palette
- Try: *create a python hello world*

## Tools
Read, Write, Edit, Delete, Search, List, Execute, Git, WebSearch, Browser.
`,
  "/project/package.json": `{
  "name": "omniroute-demo",
  "version": "1.0.0",
  "private": true,
  "description": "Sample project inside Claude Code Web",
  "scripts": {
    "start": "node src/app.js",
    "test": "node src/app.js --test"
  }
}
`,
  "/project/src/app.js": `#!/usr/bin/env node
/**
 * OmniRoute demo entrypoint
 */
const { greet, add } = require("./utils");

function main() {
  const name = process.argv[2] || "world";
  console.log(greet(name));
  console.log("2 + 3 =", add(2, 3));
}

if (require.main === module) {
  main();
}

module.exports = { main };
`,
  "/project/src/utils.js": `function greet(name) {
  return \`Hello, \${name}!\`;
}

function add(a, b) {
  return a + b;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

module.exports = { greet, add, clamp };
`,
  "/project/src/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>OmniRoute Demo</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>OmniRoute</h1>
    <p>Sample page living in the virtual filesystem.</p>
  </main>
</body>
</html>
`,
  "/project/src/styles.css": `:root {
  --bg: #1a1a1a;
  --fg: #e8e8e8;
  --accent: #d97757;
}

body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
}

h1 { color: var(--accent); }
`,
  "/project/.gitignore": `node_modules/
dist/
.env
*.log
`,
  "/project/docs/guide.md": `# Developer guide

## Virtual filesystem
Files live in memory (and localStorage). Use \`/files\` or the sidebar.

## Permissions
Dangerous shell commands require confirmation.
`,
};

class VirtualFS {
  constructor() {
    this.files = {};
    this.cwd = "/project";
    this.load();
  }

  load() {
    const saved = storageGet(STORE_KEY, null);
    if (saved && saved.files && Object.keys(saved.files).length) {
      this.files = saved.files;
      this.cwd = saved.cwd || "/project";
    } else {
      this.files = { ...DEFAULT_TREE };
      this.persist();
    }
  }

  persist() {
    storageSet(STORE_KEY, { files: this.files, cwd: this.cwd });
    bus.emit("fs:change");
  }

  reset() {
    this.files = { ...DEFAULT_TREE };
    this.cwd = "/project";
    this.persist();
  }

  normalize(path) {
    if (!path) return this.cwd;
    if (!path.startsWith("/")) path = joinPath(this.cwd, path);
    else path = joinPath(path);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  }

  exists(path) {
    path = this.normalize(path);
    if (path === "/") return true;
    if (this.files[path] != null) return true;
    const prefix = path + "/";
    return Object.keys(this.files).some((p) => p.startsWith(prefix));
  }

  isDir(path) {
    path = this.normalize(path);
    if (path === "/") return true;
    if (this.files[path] != null) return false;
    const prefix = path + "/";
    return Object.keys(this.files).some((p) => p.startsWith(prefix));
  }

  isFile(path) {
    return this.files[this.normalize(path)] != null;
  }

  read(path) {
    path = this.normalize(path);
    if (this.files[path] == null) {
      const err = new Error(`ENOENT: no such file ${path}`);
      err.code = "ENOENT";
      throw err;
    }
    return this.files[path];
  }

  write(path, content) {
    path = this.normalize(path);
    if (this.isDir(path) && this.files[path] == null) {
      const err = new Error(`EISDIR: ${path} is a directory`);
      err.code = "EISDIR";
      throw err;
    }
    this.files[path] = String(content);
    this.persist();
    return { path, bytes: content.length, lines: countLines(content) };
  }

  append(path, content) {
    const prev = this.exists(path) && this.isFile(path) ? this.read(path) : "";
    return this.write(path, prev + content);
  }

  edit(path, oldText, newText) {
    const src = this.read(path);
    if (!src.includes(oldText)) {
      const err = new Error(`edit failed: needle not found in ${path}`);
      err.code = "ENOTFOUND";
      throw err;
    }
    const next = src.replace(oldText, newText);
    this.write(path, next);
    return { path, before: src, after: next };
  }

  remove(path) {
    path = this.normalize(path);
    if (this.isFile(path)) {
      delete this.files[path];
      this.persist();
      return { removed: [path] };
    }
    if (this.isDir(path)) {
      const prefix = path + "/";
      const removed = Object.keys(this.files).filter((p) => p === path || p.startsWith(prefix));
      for (const p of removed) delete this.files[p];
      this.persist();
      return { removed };
    }
    const err = new Error(`ENOENT: ${path}`);
    err.code = "ENOENT";
    throw err;
  }

  mkdir(path) {
    path = this.normalize(path);
    const keep = joinPath(path, ".gitkeep");
    if (!this.exists(keep)) this.write(keep, "");
    return { path };
  }

  list(path, { recursive = false } = {}) {
    path = this.normalize(path);
    const prefix = path === "/" ? "/" : path + "/";
    const names = new Map();
    for (const p of Object.keys(this.files)) {
      if (path !== "/" && p !== path && !p.startsWith(prefix)) continue;
      if (p === path) continue;
      const rest = path === "/" ? p.slice(1) : p.slice(prefix.length);
      if (!rest) continue;
      if (recursive) {
        names.set(p, { path: p, isDir: false, size: this.files[p].length });
      } else {
        const top = rest.split("/")[0];
        const full = path === "/" ? "/" + top : path + "/" + top;
        const isDir = rest.includes("/") || this.isDir(full);
        if (!names.has(full)) names.set(full, { path: full, name: top, isDir, size: isDir ? 0 : (this.files[full]?.length || 0) });
      }
    }
    return [...names.values()].sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return (a.name || a.path).localeCompare(b.name || b.path);
    });
  }

  tree(path = this.cwd, depth = 4) {
    const lines = [];
    const walk = (dir, prefix, d) => {
      if (d < 0) return;
      const items = this.list(dir);
      items.forEach((it, i) => {
        const last = i === items.length - 1;
        const branch = last ? "└── " : "├── ";
        const name = it.name || basename(it.path);
        lines.push(prefix + branch + (it.isDir ? name + "/" : name));
        if (it.isDir) walk(it.path, prefix + (last ? "    " : "│   "), d - 1);
      });
    };
    lines.push(basename(path) || path);
    walk(path, "", depth);
    return lines.join("\n");
  }

  search(query, { regex = false, glob = null } = {}) {
    const hits = [];
    let re;
    try {
      re = regex ? new RegExp(query, "gi") : null;
    } catch {
      re = null;
    }
    for (const [path, content] of Object.entries(this.files)) {
      if (glob && !this._matchGlob(path, glob)) continue;
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        let ok = false;
        if (re) ok = re.test(line);
        else ok = line.toLowerCase().includes(String(query).toLowerCase());
        if (re) re.lastIndex = 0;
        if (ok) hits.push({ path, line: i + 1, text: line });
      });
    }
    return hits;
  }

  _matchGlob(path, glob) {
    const esc = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(esc + "$").test(path);
  }

  stat(path) {
    path = this.normalize(path);
    if (this.isFile(path)) {
      const c = this.files[path];
      return { path, isFile: true, isDir: false, size: c.length, lines: countLines(c), ext: extOf(path) };
    }
    if (this.isDir(path)) {
      const kids = this.list(path, { recursive: true });
      return { path, isFile: false, isDir: true, size: kids.length, entries: kids.length };
    }
    return null;
  }

  cd(path) {
    path = this.normalize(path);
    if (!this.exists(path) || (this.isFile(path))) {
      const err = new Error(`not a directory: ${path}`);
      err.code = "ENOTDIR";
      throw err;
    }
    this.cwd = path;
    this.persist();
    bus.emit("fs:cwd", this.cwd);
    return this.cwd;
  }

  allFiles() {
    return Object.keys(this.files).sort();
  }

  dump() {
    return { cwd: this.cwd, files: { ...this.files } };
  }

  importDump(dump) {
    if (!dump?.files) return;
    this.files = { ...dump.files };
    this.cwd = dump.cwd || "/project";
    this.persist();
  }

  sizeOf() {
    return Object.values(this.files).reduce((a, c) => a + c.length, 0);
  }

  summary() {
    const n = Object.keys(this.files).length;
    return `${n} files · ${fmtBytes(this.sizeOf())}`;
  }
}

export const fs = new VirtualFS();
export default fs;
