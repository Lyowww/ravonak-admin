export function parseDataDecimal(raw: string | number | null | undefined): number {
  if (raw == null) return NaN;
  if (typeof raw === "number") return raw;
  const s = String(raw).trim().replace(/,/g, ".");
  const cleaned = s.replace(/^[+-]/, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n * (s.trim().startsWith("-") ? -1 : 1) : NaN;
}

export function formatDataUsd(
  value: string | number | null | undefined,
  opts?: { maximumFractionDigits?: number }
): string {
  const n = parseDataDecimal(value);
  if (!Number.isFinite(n)) return "—";
  const max = opts?.maximumFractionDigits ?? 2;
  return `${n.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  })} $`;
}

export function formatDataRate(value: string | number | null | undefined): string {
  const n = parseDataDecimal(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

/** API date YYYY-MM-DD → DD.MM.YYYY */
export function formatEntryDateRu(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return isoDate;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

/** DD.MM.YYYY or YYYY-MM-DD → YYYY-MM-DD */
export function parseDateToApi(s: string): string | null {
  const t = s.trim();
  const dmY = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(t);
  if (dmY) {
    const d = dmY[1].padStart(2, "0");
    const mo = dmY[2].padStart(2, "0");
    const y = dmY[3];
    return `${y}-${mo}-${d}`;
  }
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (ymd) return t;
  return null;
}

export function todayApiDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function todayRuDate(): string {
  return formatEntryDateRu(todayApiDate());
}

/** Normalize categories API (OpenAPI may use loose item shape). */
export function normalizeDebitCategories(data: unknown): {
  category: string;
  label: string;
}[] {
  if (typeof data !== "object" || data === null) return [];
  const items = (data as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return items.map((row, i) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const o = row as Record<string, unknown>;
      const category =
        typeof o.category === "string"
          ? o.category
          : typeof o.value === "string"
            ? o.value
            : typeof o.key === "string"
              ? o.key
              : `category_${i}`;
      const label =
        typeof o.label_ru === "string"
          ? o.label_ru
          : typeof o.label === "string"
            ? o.label
            : typeof o.title === "string"
              ? o.title
              : typeof o.name === "string"
                ? o.name
                : category;
      return { category, label };
    }
    return { category: `category_${i}`, label: String(row) };
  });
}
