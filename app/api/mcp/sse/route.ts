import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal MCP SSE transport: emits the endpoint and heartbeat events.
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const endpoint = `${req.nextUrl.protocol}//${req.nextUrl.host}/api/mcp/stream`;
      controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpoint}\n\n`));
      const timer = setInterval(() => {
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${new Date().toISOString()}\n\n`));
      }, 10_000);
      req.signal.addEventListener("abort", () => {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // noop
        }
      });
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
