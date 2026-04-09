/**
 * Resolves the URL for authenticated JSON calls from the app.
 *
 * In the **browser**, paths stay same-origin (`/api/...`) so Next.js route handlers
 * proxy to the backend (`API_URL`). Hitting `NEXT_PUBLIC_API_URL` directly from the
 * page would require CORS on the backend and often fails with `Failed to fetch`.
 *
 * On the **server** (if this ever runs there), `NEXT_PUBLIC_API_URL` can still
 * rewrite to an absolute backend URL — same idea as `getAuthRequestUrl` for auth.
 * Path must be `/api/...` optionally with `?query`.
 */
export function resolvePublicApiRequestUrl(fullPath: string): string {
  if (fullPath.startsWith("http://") || fullPath.startsWith("https://")) {
    return fullPath;
  }

  // Client: always use Next.js `/api/*` proxy (no cross-origin fetch to backend).
  if (typeof window !== "undefined") {
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
