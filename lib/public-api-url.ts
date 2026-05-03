/**
 * Resolves the URL for authenticated JSON calls from the app.
 *
 * If `NEXT_PUBLIC_API_URL` is set, `/api/...` becomes an absolute URL on the
 * backend (same behavior as `getAuthRequestUrl`). The backend must allow CORS
 * from the admin origin when using this in the browser.
 *
 * If unset, paths stay same-origin (`/api/...`) so Next.js route handlers proxy
 * via `API_URL` (no CORS needed).
 *
 * For `<img src>` with paths like `/uploads/...`, use `resolveMediaUrl` or rely
 * on the `/uploads/*` rewrite in `next.config.ts` when `API_URL` is set at build time.
 */
export function resolvePublicApiRequestUrl(fullPath: string): string {
  if (fullPath.startsWith("http://") || fullPath.startsWith("https://")) {
    return fullPath;
  }

  const trimmed =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL?.trim() : undefined;
  if (!trimmed) {
    return fullPath;
  }

  const base = trimmed.replace(/\/+$/, "");
  const normalized = base.endsWith("/api") ? base : `${base}/api`;

  const q = fullPath.indexOf("?");
  const pathname = q >= 0 ? fullPath.slice(0, q) : fullPath;
  const search = q >= 0 ? fullPath.slice(q) : "";

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
