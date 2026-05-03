import { resolveAuthHttpUrl, type AuthSegment } from "@/lib/auth-endpoints";

/**
 * Client-side URL for auth requests.
 * If NEXT_PUBLIC_API_URL is set, the browser calls the backend directly.
 * Otherwise uses same-origin `/api/auth/*` (Next.js route handlers proxy using API_URL).
 */
export function getAuthRequestUrl(segment: AuthSegment): string {
  const direct = resolveAuthHttpUrl(process.env.NEXT_PUBLIC_API_URL, segment);
  if (direct) return direct;
  return segment === "login" ? "/api/auth/login" : "/api/auth/check";
}
