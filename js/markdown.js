/* Minimal markdown renderer that cooperates with code blocks */

import { escapeHtml } from "./utils.js";

function inline(src) {
  let s = escapeHtml(src);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^\*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_])_([^_]+)_(?!_)/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

export function renderMarkdown(md) {
  const lines = String(md).split("\n");
  const html = [];
  let i = 0;
  let inList = null;
  let inQuote = false;
  let inTable = false;

  const closeLists = () => {
    if (inList) { html.push(inList === "ol" ? "</ol>" : "</ul>"); inList = null; }
  };
  const closeQuote = () => { if (inQuote) { html.push("</blockquote>"); inQuote = false; } };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeLists(); closeQuote();
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      const raw = buf.join("\n");
      html.push(`%%CODEBLOCK:${lang}:${encodeURIComponent(raw)}%%`);
      i++;
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      closeLists(); closeQuote();
      const parseRow = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = parseRow(line);
      i += 2;
      const body = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        body.push(parseRow(lines[i]));
        i++;
      }
      html.push("<table><thead><tr>" + head.map((h) => `<th>${inline(h)}</th>`).join("") + "</tr></thead><tbody>");
      for (const row of body) html.push("<tr>" + row.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
      html.push("</tbody></table>");
      continue;
    }

    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      closeLists(); closeQuote();
      html.push("<hr/>");
      i++;
      continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      closeLists(); closeQuote();
      const n = hm[1].length;
      html.push(`<h${n}>${inline(hm[2])}</h${n}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeLists();
      if (!inQuote) { html.push("<blockquote>"); inQuote = true; }
      html.push("<p>" + inline(line.replace(/^>\s?/, "")) + "</p>");
      i++;
      continue;
    } else {
      closeQuote();
    }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      const kind = ul ? "ul" : "ol";
      if (inList && inList !== kind) closeLists();
      if (!inList) { html.push(kind === "ol" ? "<ol>" : "<ul>"); inList = kind; }
      html.push(`<li>${inline((ul || ol)[1])}</li>`);
      i++;
      continue;
    } else {
      closeLists();
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^[#>`*\-\d]/.test(lines[i]) && !/^```/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    html.push("<p>" + inline(para.join(" ")) + "</p>");
  }
  closeLists();
  closeQuote();
  return html.join("\n");
}

export default { renderMarkdown };
