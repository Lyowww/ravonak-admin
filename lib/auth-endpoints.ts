export type AuthSegment = "login" | "check";

/**
 * Builds full backend URL for POST .../auth/login or GET .../auth/check.
 * `baseUrl` is either the site origin or a path ending with /api.
 */
export function resolveAuthHttpUrl(
  baseUrl: string | undefined | null,
  segment: AuthSegment
): string | null {
  const trimmed = baseUrl?.trim();
  if (!trimmed) return null;
  const base = trimmed.replace(/\/+$/, "");
  const path = segment === "login" ? "/auth/login" : "/auth/check";
  const normalized = base.endsWith("/api") ? base : `${base}/api`;
  return `${normalized}${path}`;
}
