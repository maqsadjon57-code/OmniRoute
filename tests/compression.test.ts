import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

beforeAll(() => {
  process.env.OMNIROUTE_DATA_DIR = mkdtempSync(path.join(tmpdir(), "omniroute-test-"));
});

describe("compression engines", () => {
  it("compresses prose with the caveman profile", async () => {
    const { compressMessages } = await import("@/lib/compression");
    const messages = [
      {
        role: "user" as const,
        content:
          "The reason your React component is re-rendering is likely because you are creating a new object reference on each render cycle.",
      },
    ];
    const result = compressMessages(messages, "caveman");
    expect(result.savedTokens).toBeGreaterThan(0);
    expect(result.originalTokens).toBeGreaterThan(result.compressedTokens);
    expect(result.engines.length).toBeGreaterThan(0);
  });

  it("can be disabled", async () => {
    const { compressMessages } = await import("@/lib/compression");
    const messages = [{ role: "user" as const, content: "hello hello hello" }];
    const result = compressMessages(messages, "ultra", false);
    expect(result.savedTokens).toBe(0);
    expect(result.messages).toEqual(messages);
  });
});
