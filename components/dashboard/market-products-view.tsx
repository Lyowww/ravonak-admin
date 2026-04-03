"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import {
  displayProductExternalId,
  findChapterName,
  firstSubcategoryIdInChapter,
  flattenSubcategoryOptions,
  formatProductUsd,
  formatProductUzs,
  type SubcategoryOption,
} from "@/lib/market-category-utils";
import { ProductCard } from "@/components/dashboard/product-card";
import { resolveMediaUrl } from "@/lib/media-url";
import type {
  MarketChapterNode,
  MarketProductCreateBody,
  MarketProductDetailResponse,
  MarketProductItem,
  MarketProductPatchBody,
  MarketProductsListResponse,
  MarketProductWriteResponse,
} from "@/types/market-products-api";

function IconChevronSm() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l9.5-9.5-4-4L4 16v4zm2-2h2v-1.5L13.5 9l1 1L7 18H6v-2zM15.5 6.5l1 1 2-2-1-1-2 2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Filter = { mode: "all" } | { mode: "chapter"; chapterId: number };

function AddProductModal({
  open,
  subcategoryOptions,
  defaultSubcategoryId,
  usdRate,
  onClose,
  onCreated,
}: {
  open: boolean;
  subcategoryOptions: SubcategoryOption[];
  defaultSubcategoryId: number | null;
  usdRate: number | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [priceUzs, setPriceUzs] = useState("");
  const [subId, setSubId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setShelfLife("");
    setPriceUzs("");
    setSubId(
      defaultSubcategoryId != null ? String(defaultSubcategoryId) : ""
    );
  }, [open, defaultSubcategoryId]);

  const previewUsdAdd = useMemo(() => {
    if (usdRate == null || !(usdRate > 0)) return null;
    const pu = Number(String(priceUzs).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(pu) || pu < 0) return null;
    return pu / usdRate;
  }, [priceUzs, usdRate]);

  async function submit() {
    setErr(null);
    const sid = Number(subId);
    const pu = Number(String(priceUzs).replace(/\s/g, "").replace(",", "."));
    if (!name.trim() || !sid || !Number.isFinite(pu) || pu < 0) {
      setErr("Заполните название, подкатегорию и цену в сумах");
      return;
    }
    const body: MarketProductCreateBody = {
      name: name.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || "",
      shelf_life: shelfLife.trim() || "",
      unit: "pcs",
      price_uzs: Math.round(pu),
      subcategory_id: sid,
      is_active: true,
    };
    setLoading(true);
    const r = await authenticatedFetchJson<MarketProductWriteResponse>(
      "/api/market/products",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    setLoading(false);
    if (!r.ok) {
      setErr(r.message);
      return;
    }
    onCreated();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-8 py-5">
          <h2 className="text-[20px] font-bold text-[#0a0a0a]">Добавить товар</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </div>
        <div className="grid flex-1 gap-8 overflow-y-auto p-8 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8d8dc] bg-[#f8f8f8]">
              <IconPlus />
              <p className="mt-2 text-[14px] font-medium text-[#6e6e6e]">
                Загрузить фото
              </p>
              <p className="mt-2 text-[12px] text-[#9ca3af]">URL изображения</p>
              <input
                className="mt-3 w-full max-w-[240px] rounded-lg border border-[#e4e4e4] px-3 py-2 text-[13px]"
                placeholder="https://…"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#8a8a8a]">
                Категория товара
              </label>
              <select
                className="mt-2 w-full appearance-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px] text-[#0a0a0a] outline-none"
                value={subId}
                onChange={(e) => setSubId(e.target.value)}
              >
                <option value="">Выберите категорию</option>
                {subcategoryOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="relative">
              <label className="text-[12px] font-medium text-[#8a8a8a]">
                Название продукта
              </label>
              <span className="absolute right-5 top-8 text-[#b0b0b0]">
                <IconPencil />
              </span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 pr-10 text-[14px]"
                placeholder="Введите название"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="text-[12px] font-medium text-[#8a8a8a]">
                Описание продукта
              </label>
              <span className="absolute right-5 top-8 text-[#b0b0b0]">
                <IconPencil />
              </span>
              <textarea
                rows={5}
                className="mt-1 w-full resize-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 pr-10 text-[14px]"
                placeholder="Введите описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="text-[12px] font-medium text-[#8a8a8a]">
                Срок годности
              </label>
              <span className="absolute right-5 top-8 text-[#b0b0b0]">
                <IconPencil />
              </span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 pr-10 text-[14px]"
                placeholder="Впишите кол-во дней"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#8a8a8a]">
                Цена товара за единицу
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <input
                  className="rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                  placeholder="Сумма сум"
                  inputMode="numeric"
                  value={priceUzs}
                  onChange={(e) => setPriceUzs(e.target.value)}
                />
                <div className="flex items-center rounded-2xl border border-[#e8e8ec] bg-[#fafafa] px-4 py-3 text-[13px] text-[#6e6e6e]">
                  {previewUsdAdd != null
                    ? formatProductUsd(previewUsdAdd)
                    : "≈ USD по курсу"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {err ? (
          <p className="px-8 pb-2 text-center text-[13px] text-red-600">{err}</p>
        ) : null}
        <div className="border-t border-[#ececee] px-8 py-5">
          <button
            type="button"
            disabled={loading}
            onClick={() => void submit()}
            className="w-full rounded-2xl bg-[#006c6b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
          >
            {loading ? "Сохранение…" : "Добавить продукт"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({
  open,
  productId,
  subcategoryOptions,
  usdRate,
  onClose,
  onSaved,
}: {
  open: boolean;
  productId: number | null;
  subcategoryOptions: SubcategoryOption[];
  usdRate: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [item, setItem] = useState<MarketProductItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [priceUzs, setPriceUzs] = useState("");
  const [subId, setSubId] = useState("");

  useEffect(() => {
    if (!open || productId == null) {
      setItem(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      const r = await authenticatedFetchJson<MarketProductDetailResponse>(
        `/api/market/products/${productId}`
      );
      if (cancelled) return;
      setLoading(false);
      if (!r.ok) {
        setErr(r.message);
        setItem(null);
        return;
      }
      const it = r.data.item;
      setItem(it);
      setName(it.name);
      setDescription(it.description ?? "");
      setImageUrl(it.image_url ?? "");
      setShelfLife(it.shelf_life ?? "");
      setPriceUzs(String(it.price_uzs ?? ""));
      setSubId(String(it.subcategory_id));
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  const previewUsdEdit = useMemo(() => {
    if (usdRate == null || !(usdRate > 0)) return null;
    const pu = Number(String(priceUzs).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(pu) || pu < 0) return null;
    return pu / usdRate;
  }, [priceUzs, usdRate]);

  async function save() {
    if (!item || productId == null) return;
    setErr(null);
    const sid = Number(subId);
    const pu = Number(String(priceUzs).replace(/\s/g, "").replace(",", "."));
    if (!name.trim() || !sid || !Number.isFinite(pu) || pu < 0) {
      setErr("Проверьте название, категорию и цену");
      return;
    }
    const body: MarketProductPatchBody = {
      name: name.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || "",
      shelf_life: shelfLife.trim() || "",
      unit: item.unit || "pcs",
      price_uzs: Math.round(pu),
      subcategory_id: sid,
      is_active: item.is_active,
    };
    setSaving(true);
    const r = await authenticatedFetchJson<MarketProductWriteResponse>(
      `/api/market/products/${productId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSaving(false);
    if (!r.ok) {
      setErr(r.message);
      return;
    }
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-8 py-5">
          <div>
            <h2 className="text-[20px] font-bold text-[#0a0a0a]">Товар</h2>
            {item ? (
              <p className="mt-1 text-[14px] text-[#8a8a8a]">
                ID {displayProductExternalId(item)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </div>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-[#8a8a8a]">
            Загрузка…
          </div>
        ) : (
          <div className="grid flex-1 gap-8 overflow-y-auto p-8 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-2xl border border-[#e8e8ec] bg-[#f8f8f8]">
                {imageUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveMediaUrl(imageUrl.trim())}
                    alt=""
                    className="mx-auto max-h-64 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-[#b0b0b0]">
                    Нет фото
                  </div>
                )}
              </div>
              <input
                className="w-full rounded-xl border border-[#e4e4e4] px-3 py-2 text-[13px]"
                placeholder="URL изображения"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <div>
                <label className="text-[13px] font-medium text-[#8a8a8a]">
                  Категория товара
                </label>
                <select
                  className="mt-2 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                >
                  {subcategoryOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="relative">
                <label className="text-[12px] font-medium text-[#8a8a8a]">
                  Название продукта
                </label>
                <span className="absolute right-5 top-8 text-[#b0b0b0]">
                  <IconPencil />
                </span>
                <input
                  className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 pr-10 text-[14px]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-[12px] font-medium text-[#8a8a8a]">
                  Описание продукта
                </label>
                <span className="absolute right-5 top-8 text-[#b0b0b0]">
                  <IconPencil />
                </span>
                <textarea
                  rows={5}
                  className="mt-1 w-full resize-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 pr-10 text-[14px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-[12px] font-medium text-[#8a8a8a]">
                  Срок годности
                </label>
                <span className="absolute right-5 top-8 text-[#b0b0b0]">
                  <IconPencil />
                </span>
                <input
                  className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 pr-10 text-[14px]"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#8a8a8a]">
                  Цена товара за единицу
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <input
                    className="rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    inputMode="numeric"
                    value={priceUzs}
                    onChange={(e) => setPriceUzs(e.target.value)}
                  />
                  <div className="flex items-center rounded-2xl border border-[#e8e8ec] bg-[#fafafa] px-4 py-3 text-[13px] text-[#6e6e6e]">
                    {previewUsdEdit != null
                      ? formatProductUsd(previewUsdEdit)
                      : item?.price_usd != null
                        ? formatProductUsd(item.price_usd)
                        : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {err ? (
          <p className="px-8 pb-2 text-center text-[13px] text-red-600">{err}</p>
        ) : null}
        <div className="border-t border-[#ececee] px-8 py-5">
          <button
            type="button"
            disabled={saving || loading || !item}
            onClick={() => void save()}
            className="w-full rounded-2xl bg-[#006c6b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
          >
            {saving ? "Сохранение…" : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketProductsView() {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const [tree, setTree] = useState<MarketChapterNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>({ mode: "all" });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState<MarketProductItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [usdRateDate, setUsdRateDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const subOptions = useMemo(() => flattenSubcategoryOptions(tree), [tree]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadTree = useCallback(async () => {
    setTreeLoading(true);
    const r = await authenticatedFetchJson<MarketChapterNode[]>(
      "/api/market/categories/tree"
    );
    setTreeLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      setTree([]);
      return;
    }
    setTree(Array.isArray(r.data) ? r.data : []);
  }, [router]);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    const h = urlSearchParams.get("highlight");
    if (!h) return;
    const id = Number(h);
    if (!Number.isFinite(id) || id <= 0) return;
    setEditId(id);
    router.replace(pathname, { scroll: false });
  }, [urlSearchParams, router, pathname]);

  const loadProducts = useCallback(async () => {
    setListLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: "1",
      page_size: "100",
    });
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    if (filter.mode === "chapter") {
      params.set("chapter_id", String(filter.chapterId));
    }
    const r = await authenticatedFetchJson<MarketProductsListResponse>(
      `/api/market/products?${params.toString()}`
    );
    setListLoading(false);
    if (!r.ok) {
      if (r.unauthorized) {
        router.replace("/");
        return;
      }
      setError(r.message);
      setItems([]);
      setTotal(0);
      return;
    }
    setItems(r.data.items);
    setTotal(r.data.total);
    setUsdRate(r.data.usd_rate);
    setUsdRateDate(r.data.usd_rate_date);
  }, [debouncedSearch, filter, router]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const sectionTitle = useMemo(() => {
    if (filter.mode === "all") return "Все товары";
    const name = findChapterName(tree, filter.chapterId);
    return name ?? "Товары";
  }, [filter, tree]);

  const defaultSubForAdd = useMemo(() => {
    if (filter.mode !== "chapter") return null;
    return firstSubcategoryIdInChapter(tree, filter.chapterId);
  }, [filter, tree]);

  const refresh = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="flex min-h-full flex-col bg-[#f5f5f7]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#e3e3e8] bg-white px-8 pb-5 pt-8">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
          Товары
        </h1>
        {usdRate != null ? (
          <p className="text-[13px] text-[#8a8a8a]">
            USD курс: {usdRate.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}{" "}
            {usdRateDate ? `(${usdRateDate})` : null}
          </p>
        ) : null}
      </header>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-8 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-0">
        <aside className="flex w-full max-w-[300px] shrink-0 flex-col border-r border-[#e8e8ec] bg-white px-5 py-6">
          <p className="text-[12px] font-medium uppercase tracking-wide text-[#9ca3af]">
            Категории товаров
          </p>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setFilter({ mode: "all" })}
              className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-left text-[14px] font-medium transition ${
                filter.mode === "all"
                  ? "border-[#e4e4e4] bg-[#ececee] text-[#0a0a0a]"
                  : "border-transparent bg-white text-[#0a0a0a] shadow-sm hover:bg-[#f5f5f7]"
              }`}
            >
              Все товары
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2a2e] text-white">
                <IconChevronSm />
              </span>
            </button>
            {treeLoading ? (
              <p className="text-[13px] text-[#9ca3af]">Загрузка…</p>
            ) : (
              tree.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setFilter({ mode: "chapter", chapterId: ch.id })}
                  className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-left text-[14px] font-medium transition ${
                    filter.mode === "chapter" && filter.chapterId === ch.id
                      ? "border-[#e4e4e4] bg-[#ececee] text-[#0a0a0a]"
                      : "border-transparent bg-white text-[#0a0a0a] shadow-sm hover:bg-[#f5f5f7]"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{ch.name}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a2a2e] text-white">
                    <IconChevronSm />
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f5f5f7] px-4 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-bold text-[#0a0a0a]">{sectionTitle}</h2>
            <button
              type="button"
              onClick={refresh}
              disabled={listLoading}
              className="rounded-xl border border-[#e8e8ec] bg-white px-4 py-2 text-[13px] font-medium text-[#6e6e6e] hover:bg-[#f0f0f0] disabled:opacity-50"
            >
              Обновить
            </button>
          </div>
          <input
            type="search"
            className="mt-4 w-full rounded-2xl border border-[#e8e8ec] bg-[#e9ecef] px-4 py-3.5 text-[15px] text-[#0a0a0a] placeholder:text-[#8a8a8a] outline-none focus:bg-[#e3e7eb]"
            placeholder="Поиск по ID / Названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="mt-2 text-[12px] text-[#9ca3af]">
            Найдено: {items.length} из {total}
          </p>

          <div className="relative mt-6">
            {listLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 text-[14px] text-[#6e6e6e]">
                Загрузка…
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d0d0d4] bg-white px-4 py-8 text-center transition hover:border-[#9ca3af]"
              >
                <IconPlus />
                <p className="mt-3 text-[14px] font-semibold text-[#0a0a0a]">
                  Добавить товар в категорию
                </p>
              </button>
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setEditId(p.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddProductModal
        open={addOpen}
        subcategoryOptions={subOptions}
        defaultSubcategoryId={defaultSubForAdd}
        usdRate={usdRate}
        onClose={() => setAddOpen(false)}
        onCreated={() => void loadProducts()}
      />

      <EditProductModal
        open={editId != null}
        productId={editId}
        subcategoryOptions={subOptions}
        usdRate={usdRate}
        onClose={() => setEditId(null)}
        onSaved={() => void loadProducts()}
      />
    </div>
  );
}
