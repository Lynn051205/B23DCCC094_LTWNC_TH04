const htmlSensitiveCharacters: Record<string, string> = {
  "&": "\\u0026",
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(value: unknown): string {
  const json = JSON.stringify(value);

  if (json === undefined) {
    throw new Error("Không thể serialize dữ liệu JSON-LD.");
  }

  return json.replace(/[&<>\u2028\u2029]/g, (character) => {
    return htmlSensitiveCharacters[character];
  });
}
