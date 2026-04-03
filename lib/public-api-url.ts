/**
 * When `NEXT_PUBLIC_API_URL` is set (same idea as auth in `getAuthRequestUrl`),
 * browser calls the backend directly instead of same-origin `/api/*` on Next.
 * Path must be `/api/...` optionally with `?query`.
 */
export function resolvePublicApiRequestUrl(fullPath: string): string {
  if (fullPath.startsWith("http://") || fullPath.startsWith("https://")) {
    return fullPath;
  }

  const q = fullPath.indexOf("?");
  const pathname = q >= 0 ? fullPath.slice(0, q) : fullPath;
  const search = q >= 0 ? fullPath.slice(q) : "";

  const trimmed =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL?.trim() : undefined;
  if (!trimmed) {
    return fullPath;
  }

  const base = trimmed.replace(/\/+$/, "");
  const normalized = base.endsWith("/api") ? base : `${base}/api`;

  const m = pathname.match(/^\/api(\/.*)?$/);
  if (!m) {
    return fullPath;
  }

  const rest = m[1];
  if (rest == null || rest === "") {
    return fullPath;
  }

  return `${normalized}${rest}${search}`;
}
