import type { NextRequest } from "next/server";

// In a full deployment this route is upgraded to a WebSocket by the runtime.
// In Next.js App Router we expose an SSE-style real-time stream as the light
// alternative; both clients (dashboard / external) can consume it.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ now: new Date().toISOString() })}\n\n`));
      const timer = setInterval(() => {
        controller.enqueue(
          encoder.encode(
            `event: telemetry\ndata: ${JSON.stringify({ now: new Date().toISOString(), timestamp: Date.now() })}\n\n`,
          ),
        );
      }, 5_000);
      req.signal.addEventListener("abort", () => {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
