import { describe, expect, it } from "vitest";
import { normalizeDomain } from "@/lib/domain";

const ok = (input: string) => {
  const result = normalizeDomain(input);
  if (!result.ok) throw new Error(`expected ok for ${input}: ${result.reason}`);
  return result.domain;
};

describe("normalizeDomain", () => {
  it.each([
    ["backlinksfusion.com", "backlinksfusion.com"],
    ["  BacklinksFusion.COM  ", "backlinksfusion.com"],
    ["https://www.backlinksfusion.com/pricing?x=1#top", "backlinksfusion.com"],
    ["http://shop.example.co.uk", "shop.example.co.uk"],
    ["www.example.de.", "example.de"],
    ["https://example.com:443/", "example.com"],
  ])("normalizes %s", (input, expected) => {
    expect(ok(input)).toBe(expected);
  });

  it("converts internationalized domains to punycode", () => {
    expect(ok("münchen.de")).toBe("xn--mnchen-3ya.de");
  });

  it.each([
    ["", "empty"],
    ["localhost", "localhost"],
    ["http://localhost:3000", "localhost with port"],
    ["intranet.local", ".local"],
    ["service.internal", ".internal"],
    ["127.0.0.1", "IPv4 loopback"],
    ["10.0.0.5", "private IPv4"],
    ["http://[::1]/", "IPv6"],
    ["2130706433", "integer IP"],
    ["ftp://example.com", "non-http scheme"],
    ["https://user:pass@example.com", "credentials"],
    ["example.com:8080", "custom port"],
    ["example", "single label"],
    ["exa_mple.com", "underscore"],
    ["-bad.com", "leading hyphen"],
    ["example.c0m", "numeric TLD"],
    ["javascript:alert(1)", "javascript URL"],
  ])("rejects %s (%s)", (input) => {
    expect(normalizeDomain(input).ok).toBe(false);
  });
});
