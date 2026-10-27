import { getSafeCallbackUrl } from "@/lib/safe-redirect";

describe("safe callback URL handling", () => {
  it("keeps relative paths on the application origin", () => {
    expect(getSafeCallbackUrl("/dashboard?tab=progress#today")).toBe(
      "/dashboard?tab=progress#today",
    );
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "\\\\evil.example\\steal",
  ])("falls back for external callback URL %s", (callbackUrl) => {
    expect(getSafeCallbackUrl(callbackUrl)).toBe("/dashboard");
  });
});
