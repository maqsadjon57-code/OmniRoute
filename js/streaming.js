/* Token streaming into a message body */

import { sleep } from "./utils.js";
import { renderMarkdown } from "./markdown.js";
import { hydrateMarkdownCode } from "./codeblock.js";
import { scrollToBottom } from "./output.js";
import { Settings } from "./settings.js";
import { Conversation } from "./history.js";

export async function streamText(bodyEl, text, { cps = 42, signal } = {}) {
  if (!Settings.get("streaming")) {
    hydrateMarkdownCode(renderMarkdown(text), bodyEl);
    scrollToBottom(true);
    Conversation.add({ role: "assistant", text });
    return;
  }

  let acc = "";
  const chars = [...String(text)];
  const caret = document.createElement("span");
  caret.className = "streaming-caret";

  for (let i = 0; i < chars.length; i++) {
    if (signal?.aborted) break;
    acc += chars[i];
    // flush on newline or every few chars
    if (chars[i] === "\n" || i % 3 === 0 || i === chars.length - 1) {
      hydrateMarkdownCode(renderMarkdown(acc), bodyEl);
      bodyEl.append(caret);
      scrollToBottom();
    }
    const delay = chars[i] === "\n" ? 18 : (chars[i] === " " ? 8 : Math.max(4, 1000 / cps));
    await sleep(delay);
  }
  hydrateMarkdownCode(renderMarkdown(acc), bodyEl);
  scrollToBottom(true);
  Conversation.add({ role: "assistant", text: acc });
}

export function createThinking() {
  const wrap = document.createElement("div");
  wrap.className = "thinking";
  wrap.innerHTML = `<span class="spinner-braille">⠋</span><span class="thinking-phrase">Thinking…</span>`;
  return wrap;
}

export default { streamText, createThinking };
