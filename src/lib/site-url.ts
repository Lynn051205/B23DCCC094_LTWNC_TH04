export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = new URL(configuredUrl);

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password
  ) {
    throw new Error("SITE_URL phải là URL HTTP(S) hợp lệ.");
  }

  return new URL(`${url.origin}/`);
}
