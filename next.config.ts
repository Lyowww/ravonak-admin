import type { NextConfig } from "next";

function uploadsRewriteDestination(): string | null {
  const raw = process.env.API_URL?.trim();
  if (!raw) return null;
  let base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api")) {
    base = base.slice(0, -4);
  }
  return `${base}/uploads/:path*`;
}

const uploadsDest = uploadsRewriteDestination();

const nextConfig: NextConfig = {
  async rewrites() {
    if (!uploadsDest) return [];
    return [{ source: "/uploads/:path*", destination: uploadsDest }];
  },
};

export default nextConfig;
