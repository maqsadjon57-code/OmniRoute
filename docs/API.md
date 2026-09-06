# API

The UI talks to an agent through `js/api.js`.

## Local agent (default)

`API.submit(text)` parses slash commands and natural language, then calls tools in `js/tools.js`.

```js
import { API } from "./js/api.js";
await API.submit("create a python hello world");
API.cancel();
```

## Remote backend

`js/websocket.js` exposes `Socket.connect(url)` and `Socket.prompt(text)`.

If a socket is open, prompts are sent as:

```json
{ "type": "prompt", "text": "…" }
```

The local agent is used as a fallback when no socket is connected.

To stream tokens from your own server, emit `ws:message` payloads and call `streamText` from `js/streaming.js`.

## Tools

Each tool returns a string summary and renders a tool card in the transcript.

| Tool | Method | Side effect |
|------|--------|-------------|
| Read | `Tools.Read(path)` | Opens a highlighted code block |
| Write | `Tools.Write(path, content)` | Permission + persist |
| Edit | `Tools.Edit(path, old, neu)` | Diff view |
| Delete | `Tools.Delete(path)` | Permission |
| Search | `Tools.Search(query)` | Content hits |
| List | `Tools.List(path)` | Directory listing |
| Execute | `Tools.Execute(cmd)` | Simulated shell |
| Git | `Tools.Git(args)` | Simulated git |
| Browser | `Tools.Browser(url)` | `window.open` |
| WebSearch | `Tools.WebSearch(q)` | Simulated results |
| WebFetch | `Tools.WebFetch(url)` | `fetch` + CORS fallback |

## Filesystem

`js/files.js` is an in-memory tree keyed by absolute paths, snapshotted to `localStorage` under `ccweb.fs.v1`.

## Events (`bus`)

| Event | Payload |
|-------|---------|
| `input:submit` | prompt text |
| `cmd:clear` | — |
| `cmd:welcome` | — |
| `ui:settings` | — |
| `ui:palette` | — |
| `ui:search` | — |
| `fs:change` | — |
| `settings:change` | key, value |
