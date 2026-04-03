/** Server-only: builds absolute backend URL under /api (uses API_URL). */
export function resolveBackendPath(path: string): string | null {
  const raw = process.env.API_URL?.trim();
  if (!raw) return null;
  const base = raw.replace(/\/+$/, "");
  const normalized = base.endsWith("/api") ? base : `${base}/api`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${normalized}${p}`;
}
