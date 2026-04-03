import type {
  MarketChapterNode,
  MarketProductItem,
} from "@/types/market-products-api";

export type SubcategoryOption = {
  id: number;
  label: string;
};

export function flattenSubcategoryOptions(
  tree: MarketChapterNode[]
): SubcategoryOption[] {
  const out: SubcategoryOption[] = [];
  for (const ch of tree) {
    for (const cat of ch.categories ?? []) {
      for (const sub of cat.subcategories ?? []) {
        out.push({
          id: sub.id,
          label: `${ch.name} › ${cat.name} › ${sub.name}`,
        });
      }
    }
  }
  return out;
}

export function findChapterName(
  tree: MarketChapterNode[],
  chapterId: number
): string | null {
  const ch = tree.find((c) => c.id === chapterId);
  return ch?.name ?? null;
}

export function firstSubcategoryIdInChapter(
  tree: MarketChapterNode[],
  chapterId: number
): number | null {
  const ch = tree.find((c) => c.id === chapterId);
  if (!ch) return null;
  for (const cat of ch.categories ?? []) {
    const first = cat.subcategories?.[0];
    if (first) return first.id;
  }
  return null;
}

export function formatProductUzs(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} сум`;
}

export function formatProductUsd(n: number): string {
  return `${n.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} $`;
}

export function displayProductExternalId(p: MarketProductItem): string {
  return String(p.regos_item_id ?? p.id);
}

/** Есть ли у товара акционная цена ниже базовой (по ответу API). */
export function marketProductHasPromoPricing(p: MarketProductItem): boolean {
  const u = p.promo_price_uzs;
  const d = p.promo_price_usd;
  if (u != null && Number.isFinite(u) && u < p.price_uzs) return true;
  if (d != null && Number.isFinite(d) && d < p.price_usd) return true;
  return false;
}
