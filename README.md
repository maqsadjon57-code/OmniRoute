# OmniRoute 🛣️

> **Never stop coding. Every AI tool → 352 providers — 150+ free — through one endpoint.**

OmniRoute is a universal, open-source AI gateway (MIT License). It exposes a single OpenAI-compatible API
(`/v1/chat/completions`, `/v1/models`, `/v1/responses`, `/v1/embeddings`, `/v1/images/*`, `/v1/audio/*`,
`/v1/ocr`, files & batch) that routes requests to 352+ AI providers, including **Claude**, **GPT**, **Gemini**,
**DeepSeek**, **GLM**, **Kimi**, **MiniMax**, **Grok**, OpenRouter, SiliconFlow, Cloudflare AI, NVIDIA NIM,
Cerebras, Pollinations and many more.

Built with **Node.js 22+, TypeScript, Next.js 16, React 19, Tailwind CSS 4 and SQLite (better-sqlite3)**.

## Highlights

- 🎛️ **19 routing strategies** — priority, weighted, round-robin, P2C, least-used, cost-optimized, headroom,
  reset-aware, context relay, LKGP, auto (15-factor scoring), fusion, pipeline…
- 🪄 **12 compression engines** — Lite, Caveman, RTK, Aggressive, Ultra, LLMLingua-2, OmniGlyph… saving **15–95% tokens**.
- 🔌 **36+ integrations** — Claude Code, Codex, Cursor, Cline, Aider, Copilot, Goose, OpenCode, Windsurf…
- 🛡️ **Security** — AES-256-GCM key encryption, JWT sessions, API scopes, guardrails, prompt-injection detection,
  secret masking, IP allowlists, rate limiting.
- 📊 **Live dashboard** — providers, combos, API keys, compression bench, analytics, webhooks, MCP & A2A.
- 🔄 **Resilience** — circuit breakers, cooldowns, model lockouts, fair-share quota pools, automatic fallback.
- 🌍 **43 UI languages** and **multi-platform** deployments (npm, Docker, source, PWA, Electron, Termux, AUR, Nix).

## Quick start

```bash
# npm
npm install -g omniroute
omniroute run

# source
git clone https://github.com/maqsadjon57-code/OmniRoute.git
cd OmniRoute
npm install
npm run dev
```

Open <http://localhost:20128> and connect your first provider from the Dashboard.

## Use it like OpenAI

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer or_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto/coding",
    "messages": [{"role":"user","content":"How do I fix React re-renders?"}],
    "stream": false
  }'
```

Response headers include the routing decision, compression savings and cost:
`X-OmniRoute-Decision`, `X-OmniRoute-Compression`, `X-OmniRoute-Cost`.

### Claude Code

```bash
export ANTHROPIC_BASE_URL=http://localhost:20128/v1
export ANTHROPIC_API_KEY=or_sk_live_...
claude
```

## API surface

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/v1/chat/completions` | OpenAI-compatible chat + streaming |
| `GET` | `/v1/models` | Connected models |
| `POST` | `/v1/responses` | Responses API compatibility |
| `POST` | `/v1/embeddings` | Embeddings |
| `POST` | `/v1/images/generations` | Image generation |
| `POST` | `/v1/audio/transcriptions` | Audio transcription |
| `POST` | `/v1/audio/translations` | Audio translation |
| `POST` | `/v1/ocr` | OCR |
| `POST` | `/v1/files` / `/v1/batches` | Files & batch |
| `GET` | `/api/ws` | Real-time telemetry |
| `POST` | `/api/mcp/stream` | MCP JSON-RPC |
| `GET` | `/.well-known/agent.json` | A2A Agent Card |

## Deployment

### Docker

```bash
docker build -t omniroute . 
docker run -p 20128:20128 -v $PWD/data:/app/data omniroute
```

### Docker Compose

```bash
docker compose --profile base up
```

### Bun

```bash
bun install
bun run dev
```

### Nix

```bash
nix run github:maqsadjon57-code/OmniRoute
```

Environment:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OMNIROUTE_DATA_DIR` | `./data` | SQLite data directory |
| `OMNIROUTE_MASTER_KEY` | *(dev fallback)* | AES-256-GCM master key |
| `OMNIROUTE_CATALOG_SIZE` | `60` | Catalog metadata size generated for demo (set `352` for full marketing catalog) |
| `OMNIROUTE_BASE_URL` | `http://localhost:20128` | CLI/dashboard endpoint |

## Structure

```
app/                  Next.js App Router (landing, dashboard, API)
components/           React components
lib/                  Domain logic
  db/                 SQLite + migrations + settings
  providers/          Provider catalog + lifecycle
  routing/            (combos expose routing strategies)
  compression/        12 engines + profiles
  gateway/            OpenAI-compatible proxy + fallback
  security/           Guardrails
cli/                  omniroute CLI
```

## Development

```bash
npm run dev           # start dev server on :20128
npm run build         # production build
npm run typecheck     # TypeScript strict
npm run test          # vitest
```

## License

[MIT](./LICENSE)

---

Built by a community of developers who never want to stop coding. Every AI tool, every provider, one endpoint.
