/**
 * Builds an absolute URL for media returned by the API as a path
 * (e.g. `/uploads/banners/...`). The browser cannot load those from the Next.js origin.
 * Uses `NEXT_PUBLIC_API_URL`: strips a trailing `/api` segment so static files on the
 * same host resolve correctly (e.g. `https://host/uploads/...`).
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (url == null) return "";
  const u = url.trim();
  if (u === "") return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return u;

  let base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api")) {
    base = base.slice(0, -4);
  }
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${base}${path}`;
}
