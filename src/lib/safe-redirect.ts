export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
  baseUrl = "http://localhost:3000",
): string {
  if (!callbackUrl || callbackUrl.includes("\\")) {
    return "/dashboard";
  }

  try {
    const base = new URL(baseUrl);
    const target = new URL(callbackUrl, base);

    if (target.origin !== base.origin) {
      return "/dashboard";
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/dashboard";
  }
}
