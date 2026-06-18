export function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";

    for (const param of Array.from(parsed.searchParams.keys())) {
      if (isTrackingParam(param)) {
        parsed.searchParams.delete(param);
      }
    }

    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function isTrackingParam(param: string): boolean {
  const normalized = param.toLowerCase();
  return (
    normalized.startsWith("utm_") ||
    normalized === "ref" ||
    normalized === "source" ||
    normalized === "fbclid" ||
    normalized === "gclid"
  );
}
