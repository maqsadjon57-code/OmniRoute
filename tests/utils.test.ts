import { describe, expect, it } from "vitest";
import { estimateTokens, formatTokens, safeJsonParse } from "@/lib/utils";

describe("utils", () => {
  it("estimates tokens", () => {
    expect(estimateTokens("hello")).toBeGreaterThanOrEqual(1);
    expect(estimateTokens("")).toBe(0);
  });

  it("formats tokens", () => {
    expect(formatTokens(900)).toBe("900");
    expect(formatTokens(2_500)).toBe("2.5K");
    expect(formatTokens(2_000_000)).toBe("2.00M");
  });

  it("parses json safely", () => {
    expect(safeJsonParse('{"a":1}', null)).toEqual({ a: 1 });
    expect(safeJsonParse("bad", null)).toBeNull();
  });
});
