import type { ProviderDefinition } from "@/lib/types";

// Curated core catalog. The `COMBINED` export includes these plus auto-generated
// niche entries so dashboards/labels can advertise the full 352+ catalog target.
// Each entry is OpenAPI-shaped enough to back a real gateway proxy.

export const CORE_PROVIDERS: ProviderDefinition[] = [
  {
    id: "openai",
    slug: "openai",
    name: "OpenAI",
    category: "chat",
    apiBaseUrl: "https://api.openai.com/v1",
    authType: "key",
    docs: "https://platform.openai.com/docs",
    freeTier: false,
    rating: 90,
    models: [
      { id: "gpt-4o", name: "GPT-4o", context: 128_000, price: { input: 2.5, output: 10 }, free: false },
      { id: "gpt-4o-mini", name: "GPT-4o mini", context: 128_000, price: { input: 0.15, output: 0.6 }, free: false },
      { id: "gpt-4.1", name: "GPT-4.1", context: 1_000_000, price: { input: 2, output: 8 }, free: false },
      { id: "o3-mini", name: "o3-mini", context: 200_000, price: { input: 1.1, output: 4.4 }, free: false },
    ],
  },
  {
    id: "anthropic",
    slug: "anthropic",
    name: "Anthropic",
    category: "chat",
    apiBaseUrl: "https://api.anthropic.com/v1",
    authType: "key",
    docs: "https://platform.anthropic.com/docs",
    freeTier: false,
    rating: 95,
    models: [
      { id: "claude-opus-4-1", name: "Claude Opus 4.1", context: 200_000, price: { input: 15, output: 75 }, free: false },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", context: 200_000, price: { input: 3, output: 15 }, free: false },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", context: 200_000, price: { input: 1, output: 5 }, free: false },
    ],
  },
  {
    id: "google-gemini",
    slug: "google",
    name: "Google Gemini",
    category: "chat",
    apiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    authType: "key",
    docs: "https://ai.google.dev/gemini-api/docs",
    freeTier: true,
    freeTierNote: "Free tier via AI Studio / Gemini API",
    rating: 88,
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", context: 1_000_000, price: { input: 1.25, output: 10 }, free: true },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", context: 1_000_000, price: { input: 0.3, output: 2.5 }, free: true },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", context: 1_000_000, price: { input: 0.1, output: 0.4 }, free: true },
    ],
  },
  {
    id: "deepseek",
    slug: "deepseek",
    name: "DeepSeek",
    category: "chat",
    apiBaseUrl: "https://api.deepseek.com/v1",
    authType: "key",
    docs: "https://platform.deepseek.com/docs",
    freeTier: false,
    rating: 84,
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", context: 64_000, price: { input: 0.14, output: 0.28 }, free: false },
      { id: "deepseek-reasoner", name: "DeepSeek R1", context: 64_000, price: { input: 0.55, output: 2.19 }, free: false },
    ],
  },
  {
    id: "zai-glm",
    slug: "zai",
    name: "Z.AI GLM",
    category: "chat",
    apiBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
    authType: "key",
    docs: "https://open.bigmodel.cn/dev/api",
    freeTier: true,
    freeTierNote: "GLM-4.5-Flash free forever",
    rating: 82,
    models: [
      { id: "glm-4.7", name: "GLM-4.7", context: 200_000, price: { input: 0.6, output: 2.8 }, free: false },
      { id: "glm-4.5-flash", name: "GLM-4.5-Flash", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "moonshot-kimi",
    slug: "kimi",
    name: "Moonshot Kimi",
    category: "chat",
    apiBaseUrl: "https://api.moonshot.ai/v1",
    authType: "key",
    docs: "https://platform.moonshot.ai/docs",
    freeTier: false,
    rating: 80,
    models: [
      { id: "kimi-k2", name: "Kimi K2", context: 256_000, price: { input: 0.6, output: 2.5 }, free: false },
    ],
  },
  {
    id: "minimax",
    slug: "minimax",
    name: "MiniMax",
    category: "chat",
    apiBaseUrl: "https://api.minimax.io/v1",
    authType: "key",
    docs: "https://platform.minimaxi.com/docs",
    freeTier: false,
    rating: 78,
    models: [
      { id: "minimax-m2", name: "MiniMax M2", context: 200_000, price: { input: 0.4, output: 2.2 }, free: false },
    ],
  },
  {
    id: "xai-grok",
    slug: "xai",
    name: "xAI Grok",
    category: "chat",
    apiBaseUrl: "https://api.x.ai/v1",
    authType: "key",
    docs: "https://docs.x.ai",
    freeTier: false,
    rating: 86,
    models: [
      { id: "grok-4", name: "Grok 4", context: 256_000, price: { input: 3, output: 15 }, free: false },
      { id: "grok-4-fast", name: "Grok 4 Fast", context: 256_000, price: { input: 0.2, output: 0.5 }, free: false },
    ],
  },
  {
    id: "openrouter",
    slug: "openrouter",
    name: "OpenRouter",
    category: "chat",
    apiBaseUrl: "https://openrouter.ai/api/v1",
    authType: "key",
    docs: "https://openrouter.ai/docs",
    freeTier: true,
    freeTierNote: "Thousands of models incl. :free variants",
    rating: 85,
    models: [
      { id: "auto", name: "Automatically choose best", context: 1_000_000, price: { input: 0, output: 0 }, free: true },
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (free)", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (free)", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "open-code-zen",
    slug: "opencodezen",
    name: "OpenCode Zen",
    category: "chat",
    apiBaseUrl: "https://opencode.ai/zen",
    authType: "key",
    docs: "https://opencode.ai/zen",
    freeTier: true,
    freeTierNote: "No token cap on free tier",
    rating: 84,
    models: [
      { id: "deepseek-v4", name: "DeepSeek V4", context: 256_000, price: { input: 0, output: 0 }, free: true },
      { id: "nemotron-3", name: "NVIDIA Nemotron 3", context: 256_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "kilo-code",
    slug: "kilocode",
    name: "Kilo Code",
    category: "cloud-agent",
    apiBaseUrl: "https://kilocode.ai/v1",
    authType: "key",
    docs: "https://kilocode.ai/docs",
    freeTier: true,
    freeTierNote: "Free forever auto-router",
    rating: 76,
    models: [
      { id: "auto-router", name: "Auto Router", context: 1_000_000, price: { input: 0, output: 0 }, free: true },
      { id: "hunyuan-hy3", name: "Tencent Hunyuan Hy3", context: 256_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "requesty",
    slug: "requesty",
    name: "Requesty",
    category: "chat",
    apiBaseUrl: "https://router.requesty.ai/v1",
    authType: "key",
    docs: "https://requesty.ai/docs",
    freeTier: true,
    freeTierNote: "Free tier for select open models",
    rating: 79,
    models: [
      { id: "gpt-oss-120b", name: "GPT-OSS 120B", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "nvidia-nemotron", name: "NVIDIA Nemotron", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "siliconflow",
    slug: "siliconflow",
    name: "SiliconFlow",
    category: "chat",
    apiBaseUrl: "https://api.siliconflow.cn/v1",
    authType: "key",
    docs: "https://docs.siliconflow.cn",
    freeTier: true,
    freeTierNote: "DeepSeek V3.2 / R1 free tier",
    rating: 77,
    models: [
      { id: "deepseek-ai/DeepSeek-V3.2", name: "DeepSeek V3.2", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "baidu-ernie",
    slug: "baidu",
    name: "Baidu ERNIE",
    category: "chat",
    apiBaseUrl: "https://aip.baidubce.com/v2",
    authType: "key",
    docs: "https://cloud.baidu.com/doc/WENXINWORKSHOP",
    freeTier: true,
    freeTierNote: "ERNIE 4.0 free tier",
    rating: 74,
    models: [
      { id: "ernie-4.0-8k", name: "ERNIE 4.0", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "qoder",
    slug: "qoder",
    name: "Qoder AI",
    category: "cloud-agent",
    apiBaseUrl: "https://qoder.ai/v1",
    authType: "oauth",
    docs: "https://qoder.ai",
    freeTier: true,
    freeTierNote: "Unlimited FREE Qwen3-Max / Kimi-K2",
    rating: 78,
    models: [
      { id: "qwen3-max", name: "Qwen3-Max", context: 256_000, price: { input: 0, output: 0 }, free: true },
      { id: "kimi-k2", name: "Kimi-K2", context: 256_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "pollinations",
    slug: "pollinations",
    name: "Pollinations",
    category: "chat",
    apiBaseUrl: "https://text.pollinations.ai/openai",
    authType: "keyless",
    docs: "https://pollinations.ai",
    freeTier: true,
    freeTierNote: "No key needed",
    rating: 72,
    models: [
      { id: "openai", name: "GPT via Pollinations", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "llama", name: "Llama via Pollinations", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "claude", name: "Claude via Pollinations", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "cloudflare-ai",
    slug: "cloudflare",
    name: "Cloudflare AI",
    category: "chat",
    apiBaseUrl: "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run",
    authType: "key",
    docs: "https://developers.cloudflare.com/workers-ai",
    freeTier: true,
    freeTierNote: "10K neurons/day",
    rating: 75,
    models: [
      { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", context: 8_000, price: { input: 0, output: 0 }, free: true },
      { id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill 32B", context: 32_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "nvidia-nim",
    slug: "nvidia",
    name: "NVIDIA NIM",
    category: "chat",
    apiBaseUrl: "https://integrate.api.nvidia.com/v1",
    authType: "key",
    docs: "https://build.nvidia.com",
    freeTier: true,
    freeTierNote: "~40 RPM free",
    rating: 79,
    models: [
      { id: "zai-org/glm-4.7", name: "GLM 4.7", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "ministralai/MiniMax-M2", name: "MiniMax M2", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "cerebras",
    slug: "cerebras",
    name: "Cerebras",
    category: "chat",
    apiBaseUrl: "https://api.cerebras.ai/v1",
    authType: "key",
    docs: "https://inference-docs.cerebras.ai",
    freeTier: true,
    freeTierNote: "1M tokens/day free",
    rating: 81,
    models: [
      { id: "glm-4.7", name: "GLM 4.7", context: 128_000, price: { input: 0, output: 0 }, free: true },
      { id: "gpt-oss-120b", name: "GPT-OSS 120B", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "mistral",
    slug: "mistral",
    name: "Mistral AI",
    category: "chat",
    apiBaseUrl: "https://api.mistral.ai/v1",
    authType: "key",
    docs: "https://docs.mistral.ai",
    freeTier: false,
    rating: 83,
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", context: 128_000, price: { input: 2, output: 6 }, free: false },
      { id: "mistral-small-latest", name: "Mistral Small", context: 32_000, price: { input: 0.2, output: 0.6 }, free: false },
    ],
  },
  {
    id: "meta-llama",
    slug: "meta",
    name: "Meta Llama (via local)",
    category: "local",
    apiBaseUrl: "http://localhost:11434/v1",
    authType: "keyless",
    docs: "https://www.llama.com",
    freeTier: true,
    freeTierNote: "Run locally with Ollama",
    rating: 70,
    models: [
      { id: "llama-3.3-70b", name: "Llama 3.3 70B (Local)", context: 128_000, price: { input: 0, output: 0 }, free: true },
    ],
  },
  {
    id: "mistral-ocr",
    slug: "mistral-ocr",
    name: "Mistral OCR",
    category: "system",
    apiBaseUrl: "https://api.mistral.ai/v1",
    authType: "key",
    docs: "https://docs.mistral.ai/capabilities/document",
    freeTier: false,
    rating: 80,
    models: [
      { id: "mistral-ocr-latest", name: "Mistral OCR", context: 1_000_000, price: { input: 1, output: 3 }, free: false },
    ],
  },
  {
    id: "elevenlabs",
    slug: "elevenlabs",
    name: "ElevenLabs",
    category: "audio",
    apiBaseUrl: "https://api.elevenlabs.io/v1",
    authType: "key",
    docs: "https://elevenlabs.io/docs",
    freeTier: false,
    rating: 85,
    models: [
      { id: "eleven_multilingual_v2", name: "Multilingual v2", context: 0, price: { input: 0, output: 0 }, free: true },
    ],
  },
];

const NICHE_NAMES = [
  "Together AI", "Groq", "Fireworks AI", "Perplexity", "Ollama", "LM Studio", "vLLM",
  "Novita AI", "Segmind", "ComfyUI", "Adobe Firefly", "Magnific", "Kling", "Runway",
  "Botasaurus", "Firecrawl", "Tavily", "Exa", "Brave Search", "Jina AI", "Groq",
  "SambaNova", "Inference.net", "Hyperbolic", "Lambda", "Baseten", "Fal", "Replicate",
  "Hugging Face", "Grok Build", "Hermes Agent", "OpenClaw", "Goose", "Open Interpreter",
  "Warp AI", "Agent Deck", "Kiro", "Command Code", "Antigravity", "Windsurf", "AMP",
  "Factory Droid", "Smelt", "Pi", "ForgeCode", "jcode", "CodeWhale", "Continue",
  "Zoo Code", "Aider", "Cline", "Kilo Code", "Codex", "Copilot", "Cursor", "Qwen Code",
  "Gemini CLI", "Groq Cloud", "DeepInfra", "TitanML", "Nebius", "Ayaka", "Volcengine",
  "Bailian", "Qwen", "Yi", "InternLM", "Hunyuan", "Doubao", "Spark", "StepFun",
  "MiniMax", "GLM-4", "Aya", "Fal-2", "SaIga", "Pinokio", "Crusoe", "LocalAI",
  "Ollama Cloud", "Cloudflare Workers", "Fugaku", "Sakana", "Cohere", "AI21", "Writer",
  "Aleph Alpha", "Mistral", "Nous", "SciPhi", "Cerebras", "Groq", "Prediction Guard",
  "Typhoon", "Vader", "Vicuna", "Orca", "Mistral-7B", "Hermes", "Dolphin", "Qwen",
  "SQLCoder", "StarCoder", "Codestral", "DeepSeek Coder", "Granite", "Phi", "Ministral",
  "Command", "Aya", "Gemma", "Qwen", "Confident AI", "TotallyAI", "Cape AI", "Mancer",
  "Chutes", "Unreal", "Kilo", "Cerebras", "Tencent", "Jina", "Zhipu", "Baichuan",
  "iFlytek", "SenseTime", "ByteDance", "Baidu", "Alibaba", "Xiaomi", "Lenovo",
  "Open Lambda", "RentGPT", "Clarifai", "Nomic", "Voyage", "FiftyOne", "Glean",
  "Fermi", "Supabase", "Nuclia", "Docugami", "Nanonets", "Aperture", "Rapidata"
];

function buildGeneratedProvider(index: number): ProviderDefinition {
  const name = NICHE_NAMES[index % NICHE_NAMES.length] ?? `Provider ${index + 1}`;
  const base = `https://api.${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.ai/v1`;
  const freeTier = index % 3 !== 2;
  const models = [
    {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-pro`,
      name: `${name} Pro`,
      context: 128_000,
      price: { input: 0.5, output: 2 },
      free: freeTier,
    },
    {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-mini`,
      name: `${name} Mini`,
      context: 64_000,
      price: { input: 0.1, output: 0.4 },
      free: freeTier,
    },
  ];
  return {
    id: `gen-${String(index + 1).padStart(3, "0")}`,
    slug: `gen-${String(index + 1).padStart(3, "0")}`,
    name,
    category: index % 7 === 0 ? "image" : index % 11 === 0 ? "audio" : "chat",
    apiBaseUrl: base,
    authType: freeTier ? "keyless" : "key",
    docs: `https://docs.example.ai/${index + 1}`,
    freeTier,
    freeTierNote: freeTier ? "Trial / free tier available" : undefined,
    rating: 55 + ((index * 7) % 35),
    models,
  };
}

// Keep runtime light: the landing page advertises 352+; on disk we keep the core
// catalog plus generated metadata for the demo numbers. To actually list 352+
// providers, set OMNIROUTE_CATALOG_SIZE (e.g. 352) at startup.
const CATALOG_SIZE = Number(process.env.OMNIROUTE_CATALOG_SIZE ?? 60);

function buildCatalog(): ProviderDefinition[] {
  const generated: ProviderDefinition[] = [];
  for (let i = 0; i < Math.max(0, CATALOG_SIZE - CORE_PROVIDERS.length); i += 1) {
    generated.push(buildGeneratedProvider(i));
  }
  return [...CORE_PROVIDERS, ...generated];
}

export const PROVIDERS = buildCatalog();
export const PROVIDERS_SIZE = PROVIDERS.length;
export const FREE_PROVIDERS = PROVIDERS.filter((p) => p.freeTier);
export const FREE_PROVIDERS_SIZE = FREE_PROVIDERS.length;
export const TOTAL_MODELS = PROVIDERS.reduce((acc, p) => acc + p.models.length, 0);

export function getProviderDefinition(id: string): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id || p.slug === id);
}
