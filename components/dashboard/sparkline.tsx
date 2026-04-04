"use client";

import { useId } from "react";

type SparklineProps = {
  /** Visual trend: up = green style, down = red */
  up: boolean;
  className?: string;
};

const W = 184;
const H = 107;

function buildPoints(up: boolean): string {
  const n = 10;
  const x0 = 7.6;
  const x1 = 175.6;
  const yLo = 96.1;
  const yHi = 4.6;
  const span = yLo - yHi;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = x0 + t * (x1 - x0);
    const base = up
      ? yLo - t * span * 0.88
      : yHi + t * span * 0.88;
    const wobble = Math.sin(i * 1.4 + (up ? 0 : 0.5)) * span * 0.06;
    const y = Math.min(yLo + 1, Math.max(yHi - 1, base + wobble));
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

function pointsToPathD(points: string): string {
  const parts = points.trim().split(/\s+/);
  if (parts.length === 0) return "";
  const [fx, fy] = parts[0]!.split(",").map(Number);
  let d = `M${fx} ${fy}`;
  for (let i = 1; i < parts.length; i++) {
    const [x, y] = parts[i]!.split(",").map(Number);
    d += ` L${x} ${y}`;
  }
  return d;
}

function DropShadowFilter({
  id,
  r,
  g,
  b,
}: {
  id: string;
  r: number;
  g: number;
  b: number;
}) {
  return (
    <filter
      id={id}
      x="0.0001"
      y="0.00001"
      width="183.2"
      height="106.7"
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="BackgroundImageFix" />
      <feColorMatrix
        in="SourceAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        result="hardAlpha"
      />
      <feOffset dy="3" />
      <feGaussianBlur stdDeviation="3.05" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix
        type="matrix"
        values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 0.75 0`}
      />
      <feBlend
        mode="normal"
        in2="BackgroundImageFix"
        result="effect1_dropShadow"
      />
      <feBlend
        mode="normal"
        in="SourceGraphic"
        in2="effect1_dropShadow"
        result="shape"
      />
    </filter>
  );
}

export function Sparkline({ up, className = "" }: SparklineProps) {
  const gid = useId().replace(/:/g, "");
  const pathD = pointsToPathD(buildPoints(up));
  const stroke = up ? "#13D209" : "#ef4444";
  const filterUpId = `spark-f-${gid}-up`;
  const filterDownId = `spark-f-${gid}-down`;
  const filterId = up ? filterUpId : filterDownId;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block h-[107px] w-[184px] shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <DropShadowFilter
          id={filterUpId}
          r={0.0745098}
          g={0.823529}
          b={0.0352941}
        />
        <DropShadowFilter
          id={filterDownId}
          r={0.937255}
          g={0.266667}
          b={0.266667}
        />
      </defs>
      <g filter={`url(#${filterId})`}>
        <path
          d={pathD}
          stroke={stroke}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
