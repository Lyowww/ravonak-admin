/**
 * Builds an absolute URL for media returned by the API as a path
 * (e.g. `/uploads/banners/...`). The browser cannot load those from the admin
 * SPA origin unless Next rewrites `/uploads/*` to the API host (`next.config.ts`
 * uses `API_URL`) or you set `NEXT_PUBLIC_API_URL` to the API base.
 *
 * Priority:
 * 1. Already absolute `http(s)://` — unchanged.
 * 2. `NEXT_PUBLIC_API_URL` set — strip trailing `/api` and append the path.
 * 3. Otherwise — return the path as-is; same-origin `/uploads/...` is proxied
 *    to the backend when `API_URL` was present at build time.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (url == null) return "";
  const u = url.trim();
  if (u === "") return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return u.startsWith("/") ? u : `/${u}`;

  let base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api")) {
    base = base.slice(0, -4);
  }
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${base}${path}`;
}
