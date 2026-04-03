/** Parse API decimal strings (+/- prefixes, arbitrary precision) for display. */
export function parseSimDecimal(raw: string | number | null | undefined): number {
  if (raw == null) return NaN;
  if (typeof raw === "number") return raw;
  const s = String(raw).trim().replace(/,/g, ".");
  const cleaned = s.replace(/^[+-]/, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n * (s.startsWith("-") ? -1 : 1) : NaN;
}

export function formatSimIls(value: string | number | null | undefined): string {
  const n = parseSimDecimal(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ₪`;
}

export function formatSimIlsSigned(value: string | number | null | undefined): string {
  const n = parseSimDecimal(value);
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "−";
  const abs = Math.abs(n);
  return `${sign}${abs.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ₪`;
}
