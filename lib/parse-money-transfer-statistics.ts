import type { MoneyTransferStatisticsResponse } from "@/types/money-transfer-statistics";

function readNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const x = Number(v.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(x)) return x;
  }
  return 0;
}

function readString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

/** Достаёт объект статистики из ответа (плоский или обёрнутый в `data`). */
function unwrapPayload(raw: unknown): Record<string, unknown> | null {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (
    inner !== null &&
    typeof inner === "object" &&
    !Array.isArray(inner) &&
    ("reserve_samarkand_usd" in inner || "all_orders_usd" in inner)
  ) {
    return inner as Record<string, unknown>;
  }
  return o;
}

/**
 * Приводит ответ бэкенда к типу. Строки-числа и вложенный `{ data: {...} }` поддерживаются.
 * Возвращает null, если структура не похожа на статистику.
 */
export function parseMoneyTransferStatisticsResponse(
  raw: unknown
): MoneyTransferStatisticsResponse | null {
  const o = unwrapPayload(raw);
  if (!o) return null;

  const metricKeys = [
    "reserve_samarkand_usd",
    "all_orders_count",
    "all_orders_ils",
    "all_orders_usd",
    "collected_orders_count",
    "collected_orders_ils",
    "collected_orders_usd",
    "not_collected_orders_count",
    "not_collected_orders_ils",
    "not_collected_orders_usd",
    "clients_debt_ils",
    "clients_debt_usd",
  ] as const;

  const hasMetric = metricKeys.some((k) => k in o);
  if (!hasMetric) return null;

  return {
    period: readString(o.period, "week"),
    date_from: readString(
      o.date_from,
      new Date().toISOString()
    ),
    date_to: readString(o.date_to, new Date().toISOString()),
    reserve_samarkand_usd: readNumber(o.reserve_samarkand_usd),
    all_orders_count: readNumber(o.all_orders_count),
    all_orders_ils: readNumber(o.all_orders_ils),
    all_orders_usd: readNumber(o.all_orders_usd),
    collected_orders_count: readNumber(o.collected_orders_count),
    collected_orders_ils: readNumber(o.collected_orders_ils),
    collected_orders_usd: readNumber(o.collected_orders_usd),
    not_collected_orders_count: readNumber(o.not_collected_orders_count),
    not_collected_orders_ils: readNumber(o.not_collected_orders_ils),
    not_collected_orders_usd: readNumber(o.not_collected_orders_usd),
    clients_debt_ils: readNumber(o.clients_debt_ils),
    clients_debt_usd: readNumber(o.clients_debt_usd),
  };
}
