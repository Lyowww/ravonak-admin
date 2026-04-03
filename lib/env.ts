import { resolveAuthHttpUrl, type AuthSegment } from "@/lib/auth-endpoints";

/** Server-side: uses API_URL (secret, not exposed to the browser). */
export function getApiAuthUrl(segment: AuthSegment): string | null {
  return resolveAuthHttpUrl(process.env.API_URL, segment);
}
