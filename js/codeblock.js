/* Code block rendering + copy */

import { el, escapeHtml, fmtBytes, countLines, copyText, uid } from "./utils.js";
import { highlightHtml } from "./syntax.js";
import { Settings } from "./settings.js";

export function renderCodeBlock(code, { lang = "text", filename = "", showLines } = {}) {
  const show = showLines ?? Settings.get("show_line_numbers");
  const wrap = Settings.get("word_wrap");
  const lines = highlightHtml(code, lang);
  const id = uid("cb");

  const preLines = lines.map((html, i) => {
    const ln = show ? `<span class="ln">${i + 1}</span>` : "";
    return `<div class="code-line">${ln}<span class="lc">${html || " "}</span></div>`;
  }).join("");

  const name = filename || (lang && lang !== "text" ? `snippet.${lang}` : "code");
  const wrapClass = wrap ? " wrap" : "";

  const root = el("div", { class: `code-block${wrapClass}`, id });
  root.innerHTML = `
    <div class="code-head">
      <span class="file-icon">📄</span>
      <span class="file-name">${escapeHtml(name)}</span>
      <span class="lang-tag lang-${escapeHtml(lang)}">${escapeHtml(lang)}</span>
      <div class="code-head-actions">
        <button type="button" data-act="wrap" title="Toggle wrap">wrap</button>
        <button type="button" data-act="copy" title="Copy code">copy</button>
      </div>
    </div>
    <pre class="code-pre"><code>${preLines}</code></pre>
    <div class="code-foot">
      <span>💡 ${escapeHtml(lang)}</span>
      <span>${countLines(code)} lines</span>
      <span>${fmtBytes(code.length)}</span>
    </div>
  `;

  root.querySelector('[data-act="copy"]').addEventListener("click", async (e) => {
    await copyText(code);
    const b = e.currentTarget;
    b.textContent = "copied";
    b.classList.add("copied");
    setTimeout(() => { b.textContent = "copy"; b.classList.remove("copied"); }, 1400);
  });
  root.querySelector('[data-act="wrap"]').addEventListener("click", () => {
    root.classList.toggle("wrap");
  });
  return root;
}

export function hydrateMarkdownCode(html, mount) {
  const parts = String(html).split(/%%CODEBLOCK:([^:]*):([^%]+)%%/g);
  mount.innerHTML = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      if (parts[i]) {
        const wrap = el("div");
        wrap.innerHTML = parts[i];
        mount.append(wrap);
      }
    } else if (i % 3 === 1) {
      const lang = parts[i] || "text";
      const code = decodeURIComponent(parts[i + 1] || "");
      mount.append(renderCodeBlock(code, { lang, filename: lang ? `file.${lang}` : "code" }));
    }
  }
}

export default { renderCodeBlock, hydrateMarkdownCode };
