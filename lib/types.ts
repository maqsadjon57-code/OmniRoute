export type ProviderCategory =
  | "chat"
  | "image"
  | "audio"
  | "search"
  | "local"
  | "cloud-agent"
  | "system";

export type AuthType = "key" | "oauth" | "keyless";

export interface ModelPrice {
  /** USD per 1M input tokens */
  input: number;
  /** USD per 1M output tokens */
  output: number;
}

export interface ProviderModel {
  id: string;
  name: string;
  context: number;
  price: ModelPrice;
  free: boolean;
  tasks?: string[];
}

export interface ProviderDefinition {
  id: string;
  name: string;
  slug: string;
  category: ProviderCategory;
  apiBaseUrl: string;
  authType: AuthType;
  docs: string;
  freeTier: boolean;
  freeTierNote?: string;
  /** LMArena-style quality rating, 0-100 */
  rating?: number;
  /** @deprecated kept for catalog completeness */
  logo?: string;
  models: ProviderModel[];
}

export const ROUTING_STRATEGIES = [
  "priority",
  "fill-first",
  "weighted",
  "round-robin",
  "p2c",
  "least-used",
  "random",
  "strict-random",
  "cost-optimized",
  "headroom",
  "reset-window",
  "reset-aware",
  "context-relay",
  "context-optimized",
  "cache-optimized",
  "lkgp",
  "auto",
  "fusion",
  "pipeline",
] as const;

export type RoutingStrategy = (typeof ROUTING_STRATEGIES)[number];

export const COMPRESSION_ENGINES = [
  "session-dedup",
  "ccr",
  "lite",
  "rtk",
  "responses-tool-output",
  "headroom",
  "relevance",
  "caveman",
  "aggressive",
  "llmlingua-2",
  "ultra",
  "omni-glyph",
] as const;

export type CompressionEngine = (typeof COMPRESSION_ENGINES)[number];

export interface ComboTarget {
  providerId: string;
  modelId: string;
  weight?: number;
}

export interface ComboConfig {
  id: string;
  name: string;
  strategy: RoutingStrategy;
  targets: ComboTarget[];
  weights?: Record<string, number>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: unknown;
  name?: string;
  tool_call_id?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  tools?: unknown[];
  tool_choice?: unknown;
  user?: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface RequestRecord {
  id: string;
  model: string;
  provider: string;
  combo?: string | null;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  latencyMs: number;
  status: "ok" | "error" | "fallback";
  error?: string | null;
  compressionSaved: number;
  createdAt: string;
}
