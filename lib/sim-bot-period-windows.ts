import type { SimBotPeriod } from "@/types/sim-bot-api";

export function dateStartIso(dateInput: string): string {
  return new Date(`${dateInput}T00:00:00`).toISOString();
}

export function dateEndIso(dateInput: string): string {
  return new Date(`${dateInput}T23:59:59.999`).toISOString();
}

/** Current stats window as ISO range (for period=custom on API). */
export function simBotStatsWindow(
  period: SimBotPeriod,
  customFrom: string,
  customTo: string
): { from: string; to: string } | null {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  if (period === "custom") {
    if (!customFrom || !customTo) return null;
    return { from: dateStartIso(customFrom), to: dateEndIso(customTo) };
  }

  if (period === "day") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  const start = new Date(now);
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return { from: start.toISOString(), to: end.toISOString() };
}
