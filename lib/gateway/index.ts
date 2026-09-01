import { getProvider, getProviderApiKey, listProviders } from "@/lib/providers/service";
import { createPresetCombosIfMissing, getCombo, resolveTargetForCombo } from "@/lib/combos";
import { compressMessages } from "@/lib/compression";
import { runGuardrails } from "@/lib/security/guardrails";
import { recordRequest } from "@/lib/analytics";
import { estimateTokens } from "@/lib/utils";
import type { ChatCompletionRequest, ComboTarget, Usage } from "@/lib/types";

export interface RouteSelection {
  target: ComboTarget;
  candidates?: ComboTarget[];
  targetIndex?: number;
  comboName?: string;
  decision?: string;
  compressionProfile?: string;
  compressionSaved?: number;
  mergedRequest?: ChatCompletionRequest;
}

export interface ProxyResult {
  response: Response;
  selection: RouteSelection;
  startedAt: number;
  endedAt: number;
  upstreamStatus: number;
  upstreamBody?: unknown;
  requestTokens?: number;
  responseTokens?: number;
  usage?: Usage | null;
}

export async function routeRequest(body: ChatCompletionRequest): Promise<RouteSelection> {
  createPresetCombosIfMissing();
  const model = body.model || "auto";

  // channel-style combo: auto, auto/coding, etc.
  const combo = getCombo(model);
  if (combo) {
    const candidates = combo.targets.filter((t) => {
      const p = listProviders().find((x) => x.id === t.providerId);
      return p && p.status === "connected";
    });
    const target = resolveTargetForCombo(combo) ?? candidates[0] ?? null;
    if (!target) throw new Error("Combo has no available connected targets");
    const index = Math.max(0, candidates.findIndex((c) => c.providerId === target.providerId));
    return {
      target,
      candidates,
      targetIndex: index,
      comboName: combo.name,
      decision: `combo=${combo.name} strategy=${combo.strategy}`,
    };
  }

  // inline provider/model e.g. "deepseek/deepseek-chat" or model only
  const parts = model.split("/");
  const connected = listProviders();
  const candidates = connected.map((p) => p);
  if (parts.length >= 2) {
    const provider = candidates.find((p) => p.definitionId === parts[0] || p.id === parts[0]);
    if (provider) {
      const target = { providerId: provider.id, modelId: parts.slice(1).join("/") };
      return { target, candidates: [target], targetIndex: 0, decision: `direct provider=${provider.id}` };
    }
  }
  const provider = candidates.find((p) => p.models.some((m) => m.id === model));
  if (provider) {
    const target = { providerId: provider.id, modelId: model };
    return { target, candidates: [target], targetIndex: 0, decision: `direct model=${model}` };
  }

  // fallback to auto combo
  const auto = getCombo("auto") ?? getCombo("auto/coding") ?? getCombo("auto/cheap");
  if (auto) {
    const candidates = auto.targets.filter((t) => {
      const p = listProviders().find((x) => x.id === t.providerId);
      return p && p.status === "connected";
    });
    const target = resolveTargetForCombo(auto) ?? candidates[0] ?? null;
    if (target) {
      const index = Math.max(0, candidates.findIndex((c) => c.providerId === target.providerId));
      return {
        target,
        candidates,
        targetIndex: index,
        comboName: auto.name,
        decision: `auto fallback via ${auto.name}`,
      };
    }
  }
  throw new Error(`No route found for model "${model}". Connect a provider or create a combo.`);
}

function openaiAuthHeaders(providerId: string): Record<string, string> {
  const p = getProvider(providerId);
  if (!p || !p.apiBaseUrl) return {};
  if (p.authType === "keyless") return {};
  const key = getProviderApiKey(p);
  return { Authorization: `Bearer ${key}` };
}

function shouldUseDefaultBody(p: ReturnType<typeof getProvider>): boolean {
  return p?.authType !== "keyless";
}

export async function proxyChatCompletion(
  body: ChatCompletionRequest,
  opts: { compressionOverride?: boolean; compressionProfile?: string } = {},
): Promise<ProxyResult> {
  const startedAt = Date.now();
  const selection = await routeRequest(body);
  const guard = runGuardrails(body.messages);
  const compression = compressMessages(
    guard.masked,
    opts.compressionProfile ?? selection.compressionProfile,
    opts.compressionOverride,
  );
  const candidateList = selection.candidates?.length ? selection.candidates : [selection.target];
  const startIndex = Math.max(0, selection.targetIndex ?? 0);
  const order: ComboTarget[] = [];
  for (let i = 0; i < candidateList.length; i += 1) {
    order.push(candidateList[(startIndex + i) % candidateList.length]);
  }

  let lastError = "";
  for (let attemptIndex = 0; attemptIndex < order.length; attemptIndex += 1) {
    const target = order[attemptIndex];
    const provider = getProvider(target.providerId);
    if (!provider) continue;

    const effective = {
      ...selection,
      target,
      decision: `${selection.decision ?? "route"}${attemptIndex > 0 ? ` → fallback:${target.providerId}` : ""}`,
    };

    const forwarded: ChatCompletionRequest = {
      ...body,
      model: target.modelId,
      messages: compression.messages,
    };
    const base = (provider.apiBaseUrl ?? "").replace(/\/$/, "");
    const url = `${base}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...openaiAuthHeaders(provider.id),
      "User-Agent": "OmniRoute/0.1.0",
    };
    if (shouldUseDefaultBody(provider)) headers["X-OmniRoute-Proxy"] = "true";

    let upstream: Response;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(forwarded),
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      recordRequest({
        model: body.model,
        provider: target.providerId,
        combo: selection.comboName,
        tokensIn: compression.originalTokens,
        tokensOut: 0,
        cost: 0,
        latencyMs: Date.now() - startedAt,
        status: "error",
        error: lastError,
        compressionSaved: compression.savedTokens,
      });
      continue;
    }

    const latencyMs = Date.now() - startedAt;
    if (!upstream.ok) {
      const text = await upstream.text();
      lastError = `upstream ${upstream.status}: ${text.slice(0, 500)}`;
      recordRequest({
        model: body.model,
        provider: target.providerId,
        combo: selection.comboName,
        tokensIn: compression.originalTokens,
        tokensOut: 0,
        cost: 0,
        latencyMs,
        status: "error",
        error: lastError,
        compressionSaved: compression.savedTokens,
      });
      if (attemptIndex < order.length - 1) continue;
      return {
        response: new Response(text, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "text/plain",
            "X-OmniRoute-Decision": effective.decision ?? "",
            "X-OmniRoute-Compression": `${compression.savedPercent.toFixed(0)}%`,
          },
        }),
        selection: effective,
        startedAt,
        endedAt: Date.now(),
        upstreamStatus: upstream.status,
        requestTokens: compression.originalTokens,
        responseTokens: 0,
        usage: null,
      };
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (forwarded.stream && contentType.includes("text/event-stream")) {
      // SSE passthrough. Approximate usage from a final usage SSE event.
      let inboundTokens = compression.originalTokens;
      let outboundTokens = 0;
      const stream = upstream.body!.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            const s = new TextDecoder().decode(chunk);
            const match = s.match(/"usage":\s*\{[^}]*"completion_tokens"\s*:\s*(\d+)/);
            if (match) outboundTokens = Number(match[1]);
            controller.enqueue(chunk);
          },
        }),
      );
      recordRequest({
        model: body.model,
        provider: target.providerId,
        combo: selection.comboName,
        tokensIn: inboundTokens,
        tokensOut: outboundTokens,
        cost: 0,
        latencyMs,
        status: "ok",
        error: null,
        compressionSaved: compression.savedTokens,
      });
      return {
        response: new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-OmniRoute-Decision": effective.decision ?? "",
            "X-OmniRoute-Compression": `${compression.savedPercent.toFixed(0)}%`,
          },
        }),
        selection: effective,
        startedAt,
        endedAt: Date.now(),
        upstreamStatus: 200,
        requestTokens: inboundTokens,
        responseTokens: outboundTokens,
        usage: null,
      };
    }

    const upstreamBody = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
    const usage = (upstreamBody.usage ?? null) as Usage | null;
    const responseTokens = usage?.completion_tokens ?? estimateTokens(JSON.stringify(upstreamBody.choices ?? ""));
    const requestTokens = usage?.prompt_tokens ?? compression.originalTokens;
    const providerModel = provider.models.find((m) => m.id === target.modelId);
    const cost = computeCost(providerModel?.price.input ?? 0, providerModel?.price.output ?? 0, requestTokens, responseTokens);

    recordRequest({
      model: body.model,
      provider: target.providerId,
      combo: selection.comboName,
      tokensIn: requestTokens,
      tokensOut: responseTokens,
      cost,
      latencyMs,
      status: "ok",
      error: null,
      compressionSaved: compression.savedTokens,
    });

    return {
      response: new Response(JSON.stringify(upstreamBody), {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          "X-OmniRoute-Decision": effective.decision ?? "",
          "X-OmniRoute-Compression": `${compression.savedPercent.toFixed(0)}%`,
          "X-OmniRoute-Cost": cost.toFixed(6),
        },
      }),
      selection: effective,
      startedAt,
      endedAt: Date.now(),
      upstreamStatus: upstream.status,
      upstreamBody,
      requestTokens,
      responseTokens,
      usage,
    };
  }

  throw new Error(lastError || "All providers failed. Connect a working provider or combo.");
}

export async function proxyEmbedding(body: Record<string, unknown>) {
  const selection = await routeRequestForEmbedding(body.model as string);
  const provider = getProvider(selection.target.providerId);
  if (!provider) throw new Error("No provider connected");
  const base = (provider.apiBaseUrl ?? "").replace(/\/$/, "");
  const upstream = await fetch(`${base}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...openaiAuthHeaders(provider.id) },
    body: JSON.stringify({ ...body, model: selection.target.modelId }),
  });
  return upstream;
}

export async function proxyModelsList() {
  const providers = listProviders().filter((p) => p.status === "connected");
  const data = providers.flatMap((p) =>
    p.models.map((m) => ({
      id: `${p.definitionId}/${m.id}`,
      object: "model",
      created: Math.floor(new Date(p.createdAt).getTime() / 1000),
      owned_by: p.name,
      provider: p.id,
      free: m.free || p.freeTier,
    })),
  );
  return { object: "list", data };
}

async function routeRequestForEmbedding(model: string): Promise<RouteSelection> {
  const parts = model.split("/");
  const candidates = listProviders();
  const p = parts.length >= 2 ? candidates.find((x) => x.definitionId === parts[0]) : null;
  if (p) return { target: { providerId: p.id, modelId: parts.slice(1).join("/") } };
  return { target: { providerId: candidates[0]?.id ?? "", modelId: model } };
}

export function computeCost(inputPerM: number, outputPerM: number, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * inputPerM + (outputTokens / 1_000_000) * outputPerM;
}
