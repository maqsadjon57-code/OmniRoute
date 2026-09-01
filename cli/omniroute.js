#!/usr/bin/env node
// OmniRoute CLI — minimal self-hosted control plane.
import { spawn } from "node:child_process";

const BASE = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128";

const HELP = `OmniRoute CLI

Usage:
  omniroute run              Start the gateway (npm run dev/start)
  omniroute configure        Interactive setup (placeholder)
  omniroute connect          Remote mode (placeholder)
  omniroute providers list   List connected providers
  omniroute models list      List available models
  omniroute combo list       List routing combos
  omniroute health           System health
  omniroute --help           Show this help
`;

async function main() {
  const [command] = process.argv.slice(2);
  switch (command) {
    case "run": {
      const args = process.env.NODE_ENV === "production" ? ["run", "start"] : ["run", "dev", "--", "--port", "20128"];
      const child = spawn("npm", args, { stdio: "inherit", shell: process.platform === "win32" });
      child.on("close", (code) => process.exit(code ?? 0));
      break;
    }
    case "providers":
      return json(await fetch(`${BASE}/api/providers`));
    case "models":
      return json(await fetch(`${BASE}/api/v1/models`));
    case "combo":
      return json(await fetch(`${BASE}/api/combos`));
    case "health": {
      const r = await fetch(`${BASE}/api/health`);
      return json(r);
    }
    case "configure":
      console.log("Interactive setup is available in the web dashboard: " + BASE);
      break;
    case "connect":
      console.log("Remote mode token setup is available in Settings → Integrations.");
      break;
    case "--help":
    case "help":
    case "-h":
      console.log(HELP);
      break;
    default:
      console.log(HELP);
  }
}

async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
