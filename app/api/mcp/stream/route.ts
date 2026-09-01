import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOOLS = [
  "list_models", "get_provider", "connect_provider", "disconnect_provider", "test_provider",
  "list_combos", "create_combo", "update_combo", "delete_combo", "test_combo",
  "list_keys", "create_key", "revoke_key", "list_audit", "list_events",
  "get_analytics", "get_usage", "get_quota", "get_provider_health",
  "chat", "stream_chat", "embed", "generate_image", "transcribe", "translate", "ocr",
  "compress_text", "test_compression", "set_compression_profile",
  "web_search", "list_integrations", "get_integration_config", "run_cli",
  "register_webhook", "list_webhooks", "delete_webhook",
  "mcp_server_status", "mcp_server_list_tools",
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const method = String(body.method ?? "");
  const params = (body.params ?? {}) as Record<string, unknown>;

  let result: unknown = { ok: true };
  if (method === "initialize") result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "omniroute", version: "0.1.0" } };
  else if (method === "tools/list") {
    result = { tools: TOOLS.map((name) => ({ name, description: `OmniRoute MCP tool: ${name}`, inputSchema: { type: "object" } })) };
  } else if (method === "tools/call" && params.name === "list_models") {
    result = { models: (params.count as number) ?? 352, free: 150 };
  } else if (method === "tools/call" && params.name === "get_analytics") {
    result = { summary: { requests: 0, savingsPercent: 0 } };
  } else if (method === "tools/call") {
    result = { tool: params.name, message: "Tool stub — wire to service layer", ok: true };
  } else {
    result = { error: { code: -32601, message: `Method not found: ${method}` } };
  }

  return NextResponse.json({ jsonrpc: "2.0", id: body.id ?? null, result });
}

export async function GET() {
  return NextResponse.json({
    name: "omniroute",
    version: "0.1.0",
    tools: TOOLS.length,
    scopes: ["gateway_read", "gateway_write", "admin", "providers", "combos", "keys", "analytics"],
  });
}
