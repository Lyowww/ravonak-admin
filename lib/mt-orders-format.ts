export function formatMtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMtMoney(
  n: number | null | undefined,
  maxFrac = 2
): string {
  if (n == null) return "—";
  const num = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  });
}
