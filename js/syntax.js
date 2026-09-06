/* Lightweight syntax highlighter */

import { escapeHtml } from "./utils.js";

const KEYWORDS = {
  javascript: ["break","case","catch","class","const","continue","debugger","default","delete","do","else","export","extends","false","finally","for","function","if","import","in","instanceof","let","new","null","return","static","super","switch","this","throw","true","try","typeof","var","void","while","with","yield","async","await","of","from","as"],
  typescript: ["break","case","catch","class","const","continue","debugger","default","delete","do","else","export","extends","false","finally","for","function","if","import","in","instanceof","let","new","null","return","static","super","switch","this","throw","true","try","typeof","var","void","while","with","yield","async","await","of","from","as","type","interface","enum","implements","private","public","protected","readonly","namespace","declare","abstract","keyof","infer"],
  python: ["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","False","finally","for","from","global","if","import","in","is","lambda","None","nonlocal","not","or","pass","raise","return","True","try","while","with","yield"],
  bash: ["if","then","else","elif","fi","for","while","in","do","done","case","esac","function","select","until","time","coproc"],
  go: ["break","case","chan","const","continue","default","defer","else","fallthrough","for","func","go","goto","if","import","interface","map","package","range","return","select","struct","switch","type","var"],
  rust: ["as","async","await","break","const","continue","crate","dyn","else","enum","extern","false","fn","for","if","impl","in","let","loop","match","mod","move","mut","pub","ref","return","self","Self","static","struct","super","trait","true","type","unsafe","use","where","while"],
  json: [],
  html: [],
  css: ["important","from","to"],
  markdown: [],
  c: ["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while"],
  java: ["abstract","assert","boolean","break","byte","case","catch","char","class","const","continue","default","do","double","else","enum","extends","final","finally","float","for","goto","if","implements","import","instanceof","int","interface","long","native","new","package","private","protected","public","return","short","static","strictfp","super","switch","synchronized","this","throw","throws","transient","try","void","volatile","while"],
};

const BUILTINS = {
  javascript: ["console","window","document","Array","Object","Promise","Math","JSON","Map","Set","Error","Date","Number","String","Boolean","parseInt","parseFloat","setTimeout","setInterval","require","module","exports"],
  python: ["print","len","range","int","str","list","dict","set","tuple","open","input","sum","min","max","abs","enumerate","zip","map","filter","sorted","type","isinstance","super","self"],
  bash: ["echo","cd","ls","pwd","cat","grep","awk","sed","export","alias","source","exit","read","printf","test"],
};

function tokenizeLine(line, lang) {
  if (lang === "markdown") return mdLine(line);
  if (lang === "html" || lang === "xml") return htmlLine(line);
  if (lang === "css") return cssLine(line);
  if (lang === "json") return jsonLine(line);
  if (lang === "bash" || lang === "sh" || lang === "shell") return bashLine(line);
  return codeLine(line, lang);
}

function push(out, type, text) {
  if (!text) return;
  out.push({ type, text });
}

function codeLine(line, lang) {
  const kws = new Set(KEYWORDS[lang] || KEYWORDS.javascript);
  const bins = new Set(BUILTINS[lang] || []);
  const out = [];
  const re = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/.*|#(?!\{).*|\/\*[\s\S]*?\*\/|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|\b[A-Za-z_][\w]*\b|[^\w\s]+|\s+)/g;
  let m;
  while ((m = re.exec(line))) {
    const t = m[0];
    if (/^\s+$/.test(t)) push(out, "plain", t);
    else if (/^\/\//.test(t) || /^#/.test(t) || /^\/\*/.test(t)) push(out, "cmt", t);
    else if (/^["'`]/.test(t)) push(out, "str", t);
    else if (/^-?\d/.test(t)) push(out, "num", t);
    else if (kws.has(t)) push(out, "kw", t);
    else if (bins.has(t)) push(out, "builtin", t);
    else if (/^[A-Z][\w]*$/.test(t)) push(out, "type", t);
    else if (/^[A-Za-z_][\w]*$/.test(t)) {
      const next = line.slice(m.index + t.length).match(/^\s*\(/);
      push(out, next ? "fn" : "plain", t);
    } else if (/^[+\-*/%=<>!&|^~?:]+$/.test(t)) push(out, "op", t);
    else push(out, "punc", t);
  }
  if (!out.length) push(out, "plain", line);
  return out;
}

function bashLine(line) {
  const out = [];
  if (/^\s*#/.test(line)) return [{ type: "cmt", text: line }];
  const re = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#.*|\$\{?\w+\}?|\b\d+\b|\b[A-Za-z_][\w]*\b|[^\w\s]+|\s+)/g;
  const kws = new Set(KEYWORDS.bash);
  const bins = new Set(BUILTINS.bash);
  let m;
  while ((m = re.exec(line))) {
    const t = m[0];
    if (/^\s+$/.test(t)) push(out, "plain", t);
    else if (t.startsWith("#")) push(out, "cmt", t);
    else if (/^["']/.test(t)) push(out, "str", t);
    else if (t.startsWith("$")) push(out, "var", t);
    else if (kws.has(t)) push(out, "kw", t);
    else if (bins.has(t)) push(out, "fn", t);
    else if (/^\d/.test(t)) push(out, "num", t);
    else push(out, "plain", t);
  }
  return out.length ? out : [{ type: "plain", text: line }];
}

function jsonLine(line) {
  const out = [];
  const re = /("(?:\\.|[^"\\])*")|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?|[^\w\s"]+|\s+/gi;
  let m;
  while ((m = re.exec(line))) {
    const t = m[0];
    if (/^\s+$/.test(t)) push(out, "plain", t);
    else if (t.startsWith('"')) {
      const rest = line.slice(m.index + t.length);
      push(out, rest.trimStart().startsWith(":") ? "prop" : "str", t);
    } else if (/true|false|null/i.test(t)) push(out, "kw", t);
    else if (/^-?\d/.test(t)) push(out, "num", t);
    else push(out, "punc", t);
  }
  return out.length ? out : [{ type: "plain", text: line }];
}

function htmlLine(line) {
  const out = [];
  const re = /(<\/?[A-Za-z][\w:-]*|\s+[A-Za-z_:][\w:.-]*(?==)|"[^"]*"|'[^']*'|>|\/>|<!--[\s\S]*?-->|[^<>]+)/g;
  let m;
  while ((m = re.exec(line))) {
    const t = m[0];
    if (/^<!--/.test(t)) push(out, "cmt", t);
    else if (/^<\//.test(t) || /^<[A-Za-z]/.test(t)) push(out, "tag", t);
    else if (/^\s+[A-Za-z]/.test(t)) push(out, "attr", t);
    else if (/^["']/.test(t)) push(out, "str", t);
    else if (t === ">" || t === "/>") push(out, "tag", t);
    else push(out, "plain", t);
  }
  return out.length ? out : [{ type: "plain", text: line }];
}

function cssLine(line) {
  const out = [];
  const re = /(\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|#[0-9A-Fa-f]{3,8}|\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?\b|[.#]?[A-Za-z_-][\w-]*|[^\w\s]+|\s+)/g;
  let m;
  while ((m = re.exec(line))) {
    const t = m[0];
    if (/^\s+$/.test(t)) push(out, "plain", t);
    else if (/^\/\*/.test(t)) push(out, "cmt", t);
    else if (/^["']/.test(t)) push(out, "str", t);
    else if (t.startsWith("#") && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(t)) push(out, "num", t);
    else if (/^\d/.test(t)) push(out, "num", t);
    else if (t.startsWith(".") || t.startsWith("#")) push(out, "fn", t);
    else if (["important", "from", "to"].includes(t)) push(out, "kw", t);
    else push(out, "plain", t);
  }
  return out.length ? out : [{ type: "plain", text: line }];
}

function mdLine(line) {
  if (/^#{1,6}\s/.test(line)) return [{ type: "kw", text: line }];
  if (/^>\s?/.test(line)) return [{ type: "cmt", text: line }];
  if (/^(\s*[-*+]|\s*\d+\.)\s/.test(line)) return [{ type: "type", text: line }];
  if (/^```/.test(line)) return [{ type: "fn", text: line }];
  const out = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m;
  while ((m = re.exec(line))) {
    if (m.index > last) push(out, "plain", line.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("`")) push(out, "str", t);
    else if (t.startsWith("[")) push(out, "info", t);
    else push(out, "kw", t);
    last = m.index + t.length;
  }
  if (last < line.length) push(out, "plain", line.slice(last));
  return out.length ? out : [{ type: "plain", text: line }];
}

export function highlight(code, lang = "text") {
  lang = (lang || "text").toLowerCase();
  if (lang === "js" || lang === "mjs" || lang === "cjs" || lang === "jsx") lang = "javascript";
  if (lang === "ts" || lang === "tsx") lang = "typescript";
  if (lang === "py") lang = "python";
  if (lang === "sh" || lang === "zsh" || lang === "shell") lang = "bash";
  const lines = String(code).replace(/\n$/, "").split("\n");
  return lines.map((line) => tokenizeLine(line, lang));
}

export function tokensToHtml(tokens) {
  return tokens.map((t) => {
    if (t.type === "plain") return escapeHtml(t.text);
    return `<span class="tok-${t.type}">${escapeHtml(t.text)}</span>`;
  }).join("");
}

export function highlightHtml(code, lang) {
  return highlight(code, lang).map(tokensToHtml);
}

export default { highlight, highlightHtml, tokensToHtml };
