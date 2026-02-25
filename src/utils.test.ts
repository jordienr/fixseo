import { describe, it, expect } from "vitest";
import { normalizeUrl, sameOrigin, getDepth } from "./utils";

describe("normalizeUrl", () => {
  it("should normalize a valid URL", () => {
    expect(normalizeUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeUrl("https://example.com/path")).toBe(
      "https://example.com/path",
    );
  });

  it("should return the input for invalid URLs", () => {
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
    expect(normalizeUrl("")).toBe("");
  });
});

describe("sameOrigin", () => {
  it("should return true for same origin URLs", () => {
    expect(
      sameOrigin("https://example.com/page1", "https://example.com/page2"),
    ).toBe(true);
  });

  it("should return false for different origin URLs", () => {
    expect(sameOrigin("https://example.com", "https://other.com")).toBe(false);
  });

  it("should return false for invalid URLs", () => {
    expect(sameOrigin("not-a-url", "https://example.com")).toBe(false);
  });
});

describe("getDepth", () => {
  it("should return correct depth for URLs", () => {
    expect(getDepth("https://example.com", "https://example.com")).toBe(0);
    expect(getDepth("https://example.com/a", "https://example.com")).toBe(1);
    expect(getDepth("https://example.com/a/b", "https://example.com")).toBe(2);
    expect(getDepth("https://example.com/a/b/c", "https://example.com")).toBe(
      3,
    );
  });

  it("should return 0 for invalid URLs", () => {
    expect(getDepth("not-a-url", "https://example.com")).toBe(0);
  });
});
