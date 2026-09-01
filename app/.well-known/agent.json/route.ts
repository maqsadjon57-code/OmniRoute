import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// A2A Agent Card.
export async function GET() {
  return NextResponse.json({
    name: "OmniRoute",
    description: "Universal AI gateway with 352+ providers, routing strategies, compression, and MCP/A2A.",
    url: "/a2a",
    version: "0.1.0",
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    preferredTransport: "JSONRPC",
    skills: [
      { id: "list-providers", name: "List Providers", description: "List connected AI providers" },
      { id: "route-request", name: "Route Request", description: "Route a chat request to the best provider" },
      { id: "compress-context", name: "Compress Context", description: "Compress long prompts to save tokens" },
      { id: "monitor-usage", name: "Monitor Usage", description: "Live quota and cost monitoring" },
      { id: "manage-keys", name: "Manage Keys", description: "Create/revoke gateway API keys" },
      { id: "run-integration", name: "Run Integration", description: "Configure CLI/agent tools" },
    ],
  });
}
