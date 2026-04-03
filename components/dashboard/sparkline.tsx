"use client";

import { useId } from "react";

type SparklineProps = {
  /** Visual trend: up = green style, down = red */
  up: boolean;
  className?: string;
};

function buildPoints(up: boolean, width: number, height: number): string {
  const n = 10;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = 4 + (i / (n - 1)) * (width - 8);
    const t = i / (n - 1);
    const base = up
      ? height * (0.82 - t * 0.52)
      : height * (0.28 + t * 0.52);
    const wobble = Math.sin(i * 1.4 + (up ? 0 : 0.5)) * height * 0.07;
    const y = Math.min(height - 4, Math.max(4, base + wobble));
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

export function Sparkline({ up, className = "" }: SparklineProps) {
  const gid = useId().replace(/:/g, "");
  const w = 140;
  const h = 56;
  const points = buildPoints(up, w, h);
  const stroke = up ? "#22c55e" : "#ef4444";
  const glow = up ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`block h-14 w-[140px] shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <filter id={`glow-${gid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        fill="none"
        stroke={glow}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.35}
      />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        filter={`url(#glow-${gid})`}
      />
    </svg>
  );
}
