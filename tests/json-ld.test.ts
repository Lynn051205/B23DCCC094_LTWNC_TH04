import { serializeJsonLd } from "@/lib/json-ld";

it("escapes HTML-sensitive characters without changing JSON data", () => {
  const value = { name: '</script><script>alert("x")</script>&' };
  const serialized = serializeJsonLd(value);

  expect(serialized).not.toContain("<");
  expect(serialized).not.toContain(">");
  expect(serialized).not.toContain("&");
  expect(JSON.parse(serialized)).toEqual(value);
});

it("reports values that cannot be serialized", () => {
  expect(() => serializeJsonLd(undefined)).toThrow(
    "Không thể serialize dữ liệu JSON-LD.",
  );
});
