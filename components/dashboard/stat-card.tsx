"use client";

import { Sparkline } from "./sparkline";

type StatCardProps = {
  title: string;
  value: string;
  deltaFormatted: string;
  /** Line direction + delta color */
  positive: boolean;
  /** Total users: sparkline always up + green */
  alwaysUp?: boolean;
};

export function StatCard({
  title,
  value,
  deltaFormatted,
  positive,
  alwaysUp,
}: StatCardProps) {
  const lineUp = alwaysUp ? true : positive;
  const deltaGreen = alwaysUp ? true : positive;

  return (
    <div className="flex min-h-[132px] flex-col rounded-2xl bg-white p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
      <p className="text-[13px] font-medium leading-tight text-[#1a1a1a]">{title}</p>
      <div className="mt-3 flex flex-1 items-center justify-between gap-3">
        <Sparkline up={lineUp} />
        <div className="flex min-w-0 flex-col items-end text-right">
          <span className="text-[28px] font-bold leading-none tracking-tight text-[#0a0a0a]">
            {value}
          </span>
          <span
            className={`mt-2 text-[14px] font-semibold tabular-nums ${
              deltaGreen ? "text-[#22c55e]" : "text-[#ef4444]"
            }`}
          >
            {deltaFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}
