"use client";

/* eslint-disable react-hooks/set-state-in-effect -- modal field sync and data loaders call setState intentionally */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authenticatedFetchFormData,
  authenticatedFetchJson,
} from "@/lib/authenticated-fetch";
import { PromotionProductCard } from "@/components/dashboard/promotion-product-card";
import {
  formatProductUsd,
  formatProductUzs,
} from "@/lib/market-category-utils";
import { resolveMediaUrl } from "@/lib/media-url";
import type {
  MarketBannerDeleteRequestResponse,
  MarketBannerItem,
  MarketBannerSingleResponse,
  MarketBannerUploadResponse,
  MarketBannerWriteBody,
  MarketBannersListResponse,
} from "@/types/market-banners-api";
import type {
  MarketPromotionCandidateItem,
  MarketPromotionProductAddBody,
  MarketPromotionProductItem,
  MarketPromotionProductPatchBody,
  MarketPromotionProductSingleResponse,
  MarketPromotionRemoveConfirmBody,
  MarketPromotionRemoveConfirmResponse,
  MarketPromotionRemoveRequestResponse,
  MarketPromotionsCandidatesListResponse,
  MarketPromotionsProductsListResponse,
} from "@/types/market-promotions-api";

function IconPlus() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

function IconTrashBanner() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3h6M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUploadArrow() {
  return (
    <svg className="h-10 w-10 text-[#9ca3af]" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BannerCard({
  banner,
  onEdit,
  onDelete,
}: {
  banner: MarketBannerItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const img = banner.image_url?.trim();
  const imgSrc = img ? resolveMediaUrl(img) : "";
  return (
    <div className="relative w-[min(92vw,420px)] shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#d32f2f] text-white shadow-md transition hover:bg-[#b71c1c]"
        aria-label="Удалить баннер"
      >
        <IconTrashBanner />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="block w-full overflow-hidden rounded-2xl border border-[#e8e8ec] bg-white shadow-sm ring-0 transition hover:ring-2 hover:ring-[#006c6b]/30"
      >
        <div className="aspect-[950/410] w-full bg-[#f0f0f2]">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-[#9ca3af]">
              Нет изображения
            </div>
          )}
        </div>
        {banner.title ? (
          <p className="truncate px-3 py-2 text-left text-[13px] font-medium text-[#4a4a4e]">
            {banner.title}
          </p>
        ) : null}
      </button>
    </div>
  );
}

function DeleteBannerModal({
  open,
  loading,
  onClose,
  onConfirmRemove,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirmRemove: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
          aria-label="Закрыть"
        >
          <IconClose />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_351_3234)">
                <circle cx="52" cy="51.9998" r="39" stroke="#FF0000" strokeOpacity="0.75" strokeWidth="8.66667" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="52" y="69.3334" width="0.0433333" height="0.0433333" stroke="#FF0000" strokeOpacity="0.75" strokeWidth="13" strokeLinejoin="round" />
                <path d="M52 52L52 34.6667" stroke="#FF0000" strokeOpacity="0.75" strokeWidth="8.66667" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_351_3234">
                  <rect width="104" height="104" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h3 className="mt-4 text-[18px] font-bold text-[#0a0a0a]">Внимание !</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[#5a5a5e]">
            Вы действительно хотите удалить баннер с главной страницы?
          </p>
          <div className="mt-8 flex w-full gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void onConfirmRemove()}
              className="flex-1 rounded-2xl border border-[#e4e4e4] bg-[#f5f5f7] py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[#ececee] disabled:opacity-50"
            >
              {loading ? "…" : "Убрать"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
            >
              Оставить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerEditorModal({
  open,
  mode,
  initial,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: MarketBannerItem | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (mode === "edit" && initial) {
      setTitle(initial.title ?? "");
      setDescription(initial.description ?? "");
      setLinkUrl(initial.link_url ?? "");
      setOrder(initial.order ?? 0);
      setIsActive(initial.is_active ?? true);
      setImageUrl(initial.image_url ?? "");
      setUploadName(null);
    } else {
      setTitle("");
      setDescription("");
      setLinkUrl("");
      setOrder(nextOrder);
      setIsActive(true);
      setImageUrl("");
      setUploadName(null);
    }
  }, [open, mode, initial, nextOrder]);

  async function onPickFile(file: File | null) {
    if (!file) return;
    setErr(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await authenticatedFetchFormData<MarketBannerUploadResponse>(
      "/api/market/banners/upload",
      fd
    );
    setUploading(false);
    if (!r.ok) {
      setErr(r.message);
      return;
    }
    setImageUrl(r.data.image_url);
    setUploadName(r.data.filename);
  }

  async function submit() {
    setErr(null);
    const url = imageUrl.trim();
    if (!url) {
      setErr("Загрузите изображение баннера");
      return;
    }
    const body: MarketBannerWriteBody = {
      image_url: url,
      title: title.trim(),
      description: description.trim(),
      link_url: linkUrl.trim(),
      order: Number.isFinite(order) ? Math.round(order) : 0,
      is_active: isActive,
    };
    setSaving(true);
    if (mode === "create") {
      const r = await authenticatedFetchJson<MarketBannerSingleResponse>(
        "/api/market/banners",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      setSaving(false);
      if (!r.ok) {
        setErr(r.message);
        return;
      }
    } else if (mode === "edit" && initial) {
      const r = await authenticatedFetchJson<MarketBannerSingleResponse>(
        `/api/market/banners/${initial.id}`,
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
    } else {
      setSaving(false);
      return;
    }
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#0a0a0a]">Баннер</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || uploading}
            className="rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading || saving}
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8d8dc] bg-[#f8f8f8] px-4 py-10 transition hover:border-[#006c6b]/40">
              {imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(imageUrl.trim())}
                  alt=""
                  className="max-h-48 w-full max-w-md rounded-xl object-contain"
                />
              ) : (
                <>
                  <IconUploadArrow />
                  <p className="mt-3 text-center text-[15px] font-semibold text-[#4a4a4e]">
                    Размер баннера
                  </p>
                  <p className="mt-1 text-[14px] text-[#8a8a8a]">950 × 410</p>
                </>
              )}
            </div>
          </label>
          {uploadName ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ececee] bg-[#fafafa] px-4 py-2 text-[13px] text-[#5a5a5e]">
              <span className="min-w-0 truncate">{uploadName}</span>
              <button
                type="button"
                className="shrink-0 text-[#d32f2f] hover:underline"
                onClick={() => {
                  setUploadName(null);
                  setImageUrl("");
                }}
              >
                Удалить файл
              </button>
            </div>
          ) : null}
          <div>
            <label className="text-[12px] font-medium text-[#8a8a8a]">Заголовок</label>
            <input
              className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок баннера"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#8a8a8a]">Описание</label>
            <textarea
              rows={3}
              className="mt-1 w-full resize-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткий текст"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#8a8a8a]">Ссылка</label>
            <input
              className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-medium text-[#8a8a8a]">Порядок</label>
              <input
                type="number"
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <label className="flex cursor-pointer items-end gap-3 pb-3">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-[#c4c4c8] text-[#006c6b] focus:ring-[#006c6b]"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-[14px] font-medium text-[#0a0a0a]">Активен</span>
            </label>
          </div>
        </div>
        {err ? (
          <p className="px-6 pb-2 text-center text-[13px] text-red-600">{err}</p>
        ) : null}
        <div className="border-t border-[#ececee] px-6 py-5">
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => void submit()}
            className="w-full rounded-2xl bg-[#006c6b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
          >
            {saving
              ? "Сохранение…"
              : mode === "create"
                ? "Добавить баннер"
                : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function clampDiscountPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function computeDiscountedUzs(base: number, pct: number): number {
  return Math.round((base * (100 - clampDiscountPct(pct))) / 100);
}

function computeDiscountedUsd(base: number, pct: number): number {
  const p = clampDiscountPct(pct);
  return Math.round((base * (100 - p)) / 100 * 100) / 100;
}

function DeletePromoProductModal({
  open,
  loading,
  onClose,
  onConfirmRemove,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirmRemove: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
          aria-label="Закрыть"
        >
          <IconClose />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_promo_del)">
                <circle cx="52" cy="51.9998" r="39" stroke="#FF0000" strokeOpacity="0.75" strokeWidth="8.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M52 52L52 34.6667" stroke="#FF0000" strokeOpacity="0.75" strokeWidth="8.66667" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_promo_del">
                  <rect width="104" height="104" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h3 className="mt-4 text-[18px] font-bold text-[#0a0a0a]">Внимание !</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[#5a5a5e]">
            Вы действительно хотите удалить товар из акционного списка ?
          </p>
          <div className="mt-8 flex w-full gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void onConfirmRemove()}
              className="flex-1 rounded-2xl border border-[#e4e4e4] bg-[#f5f5f7] py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[#ececee] disabled:opacity-50"
            >
              {loading ? "…" : "Убрать"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
            >
              Оставить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CANDIDATES_PAGE_SIZE = 50;

function CandidatesPickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (c: MarketPromotionCandidateItem) => void;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadedPage, setLoadedPage] = useState(0);
  const [items, setItems] = useState<MarketPromotionCandidateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCandidatesPage = useCallback(
    async (page: number, replace: boolean) => {
      setLoading(true);
      if (replace) {
        setItems([]);
        setTotal(0);
        setLoadedPage(0);
      }
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(CANDIDATES_PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const r = await authenticatedFetchJson<MarketPromotionsCandidatesListResponse>(
        `/api/market/promotions/candidates?${params}`
      );
      setLoading(false);
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        return;
      }
      const chunk = r.data.items ?? [];
      setTotal(r.data.total ?? 0);
      if (replace) setItems(chunk);
      else setItems((prev) => [...prev, ...chunk]);
      setLoadedPage(page);
    },
    [debouncedSearch, router]
  );

  useEffect(() => {
    if (!open) return;
    void loadCandidatesPage(1, true);
  }, [open, debouncedSearch, loadCandidatesPage]);

  if (!open) return null;

  const hasMore = items.length < total;
  const loadMore = () => {
    if (loading || !hasMore) return;
    void loadCandidatesPage(loadedPage + 1, false);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/45 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#0a0a0a]">Добавить товар в акцию</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </div>
        <div className="border-b border-[#ececee] px-6 py-4">
          <input
            className="w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px] placeholder:text-[#9ca3af]"
            placeholder="Поиск по ID / Названию"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading && items.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-[#8a8a8a]">Загрузка…</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-[#8a8a8a]">Ничего не найдено</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((c) => {
                  const img = c.image_url?.trim();
                  const imgSrc = img ? resolveMediaUrl(img) : "";
                  return (
                    <button
                      key={`${c.id}-${c.regos_item_id}`}
                      type="button"
                      onClick={() => onPick(c)}
                      className="flex flex-col rounded-2xl border border-[#e8e8ec] bg-white p-3 text-left shadow-sm transition hover:border-[#006c6b]/40"
                    >
                      <p className="text-[11px] text-[#8a8a8a]">ID {c.id}</p>
                      <div className="mt-2 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-[#fafafa]">
                        {imgSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgSrc} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[11px] text-[#c0c0c0]">Нет фото</span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 min-h-[2.25rem] text-[12px] font-semibold leading-snug text-[#0a0a0a]">
                        {c.name}
                      </p>
                      <div className="mt-2 flex justify-between gap-1 text-[11px] font-semibold text-[#0a0a0a]">
                        <span>{formatProductUzs(c.price_uzs)}</span>
                        <span>{formatProductUsd(c.price_usd)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasMore ? (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={loadMore}
                    className="rounded-2xl border border-[#e8e8ec] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#006c6b] hover:bg-[#f5f5f7] disabled:opacity-50"
                  >
                    {loading ? "Загрузка…" : "Показать ещё"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PromotionProductEditorModal({
  open,
  mode,
  candidate,
  editProductId,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "add" | "edit";
  candidate: MarketPromotionCandidateItem | null;
  editProductId: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [discount, setDiscount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<MarketPromotionProductItem | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setDiscount(10);
    setDetail(null);
    if (mode === "add" && candidate) {
      setDiscount(10);
    }
  }, [open, mode, candidate]);

  useEffect(() => {
    if (!open || mode !== "edit" || editProductId == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const r = await authenticatedFetchJson<MarketPromotionProductSingleResponse>(
        `/api/market/promotions/products/${editProductId}`
      );
      setLoading(false);
      if (cancelled) return;
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        else setErr(r.message);
        return;
      }
      setDetail(r.data.item);
      setDiscount(Math.round(r.data.item.discount_percentage));
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mode, editProductId, router]);

  const baseUzs =
    mode === "add" && candidate
      ? candidate.price_uzs
      : detail?.price_uzs ?? 0;
  const baseUsd =
    mode === "add" && candidate ? candidate.price_usd : detail?.price_usd ?? 0;
  const showUzs = computeDiscountedUzs(baseUzs, discount);
  const showUsd = computeDiscountedUsd(baseUsd, discount);

  async function submit() {
    setErr(null);
    const pct = clampDiscountPct(discount);
    if (pct < 0 || pct > 100) {
      setErr("Укажите процент скидки от 0 до 100");
      return;
    }
    setSaving(true);
    if (mode === "add" && candidate) {
      const body: MarketPromotionProductAddBody = {
        product_id: candidate.id,
        discount_percentage: pct,
      };
      const r = await authenticatedFetchJson<MarketPromotionProductSingleResponse>(
        "/api/market/promotions/products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      setSaving(false);
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        else setErr(r.message);
        return;
      }
      onSaved();
      onClose();
      return;
    }
    if (mode === "edit" && editProductId != null) {
      const body: MarketPromotionProductPatchBody = { discount_percentage: pct };
      const r = await authenticatedFetchJson<MarketPromotionProductSingleResponse>(
        `/api/market/promotions/products/${editProductId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      setSaving(false);
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        else setErr(r.message);
        return;
      }
      onSaved();
      onClose();
    }
    setSaving(false);
  }

  if (!open) return null;
  if (mode === "add" && !candidate) return null;

  const titleId =
    mode === "add" && candidate
      ? candidate.id
      : editProductId ?? detail?.product_id ?? 0;
  const name =
    mode === "add" && candidate
      ? candidate.name
      : detail?.product_name ?? "…";
  const description =
    mode === "add" && candidate ? candidate.description ?? "" : "";
  const shelfLife =
    mode === "add" && candidate ? candidate.shelf_life ?? "" : "";

  const img =
    mode === "add" && candidate
      ? candidate.image_url?.trim()
      : detail?.image_url?.trim() ?? "";
  const imgSrc = img ? resolveMediaUrl(img) : "";

  return (
    <div className="fixed inset-0 z-[56] flex items-center justify-center bg-black/45 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#0a0a0a]">Товар ID {titleId}</h2>
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
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {loading && mode === "edit" ? (
            <p className="py-8 text-center text-[14px] text-[#8a8a8a]">Загрузка…</p>
          ) : mode === "edit" && !detail ? (
            <p className="py-8 text-center text-[14px] text-red-600">
              {err ?? "Не удалось загрузить товар"}
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
              <div className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-2xl border border-[#ececee] bg-[#fafafa]">
                  <div className="flex aspect-square items-center justify-center p-4">
                    {imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgSrc} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[13px] text-[#b0b0b0]">Нет фото</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={saving || (mode === "edit" && loading)}
                  onClick={() => void submit()}
                  className="w-full rounded-2xl bg-[#006c6b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
                >
                  {mode === "add" ? "Добавить акцию" : "Сохранить"}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-[#8a8a8a]">
                    Название продукта
                  </label>
                  <input
                    readOnly
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    value={name}
                  />
                </div>
                {mode === "add" ? (
                  <>
                    <div>
                      <label className="text-[12px] font-medium text-[#8a8a8a]">
                        Описание продукта
                      </label>
                      <textarea
                        readOnly
                        rows={4}
                        className="mt-1 w-full resize-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                        value={description}
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium text-[#8a8a8a]">
                        Срок годности
                      </label>
                      <input
                        readOnly
                        className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                        value={shelfLife}
                      />
                    </div>
                  </>
                ) : null}
                <div>
                  <label className="text-[12px] font-medium text-[#8a8a8a]">
                    Цена товара за единицу
                  </label>
                  <div className="mt-1 flex flex-wrap gap-4 text-[15px] font-semibold text-[#0a0a0a]">
                    <span>{formatProductUzs(baseUzs)}</span>
                    <span className="text-[#c0c0c0]">·</span>
                    <span>{formatProductUsd(baseUsd)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#8a8a8a]">
                    Размер скидки
                  </label>
                  <div className="mt-1 flex max-w-[200px] items-center gap-2 rounded-2xl border border-[#e8e8ec] bg-white px-4 py-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-semibold outline-none"
                      value={Number.isFinite(discount) ? discount : ""}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                    <span className="text-[15px] font-semibold text-[#6e6e6e]">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#8a8a8a]">
                    Цена товара за единицу со скидкой
                  </label>
                  <div className="mt-1 flex flex-wrap gap-4 text-[15px] font-semibold">
                    <span className="text-[#c62828]">{formatProductUzs(showUzs)}</span>
                    <span className="text-[#c0c0c0]">·</span>
                    <span className="text-[#c62828]">{formatProductUsd(showUsd)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {err && !(mode === "edit" && !detail && !loading) ? (
          <p className="px-6 pb-4 text-center text-[13px] text-red-600">{err}</p>
        ) : null}
      </div>
    </div>
  );
}

export function MarketBannersView() {
  const router = useRouter();
  const [banners, setBanners] = useState<MarketBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<MarketBannerItem | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [promoItems, setPromoItems] = useState<MarketPromotionProductItem[]>([]);
  const [promoTotal, setPromoTotal] = useState(0);
  const [promoPage, setPromoPage] = useState(1);
  const [promoLoading, setPromoLoading] = useState(true);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [candidatesOpen, setCandidatesOpen] = useState(false);
  const [promoEditorOpen, setPromoEditorOpen] = useState(false);
  const [promoEditorMode, setPromoEditorMode] = useState<"add" | "edit">("add");
  const [promoCandidate, setPromoCandidate] = useState<MarketPromotionCandidateItem | null>(
    null
  );
  const [promoEditId, setPromoEditId] = useState<number | null>(null);

  const [deletePromoId, setDeletePromoId] = useState<number | null>(null);
  const [deletePromoToken, setDeletePromoToken] = useState<string | null>(null);
  const [deletePromoLoading, setDeletePromoLoading] = useState(false);
  const [promoRemoveRequestingId, setPromoRemoveRequestingId] = useState<number | null>(
    null
  );
  const [promoPickerSession, setPromoPickerSession] = useState(0);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await authenticatedFetchJson<MarketBannersListResponse>(
      "/api/market/banners"
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      setBanners([]);
      return;
    }
    const items = Array.isArray(r.data.items) ? r.data.items : [];
    setBanners([...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }, [router]);

  const loadPromoProducts = useCallback(async () => {
    setPromoLoading(true);
    setPromoError(null);
    const params = new URLSearchParams({ page: "1", page_size: "200" });
    const r = await authenticatedFetchJson<MarketPromotionsProductsListResponse>(
      `/api/market/promotions/products?${params}`
    );
    setPromoLoading(false);
    if (!r.ok) {
      if (r.unauthorized) {
        router.replace("/");
        setPromoItems([]);
        setPromoTotal(0);
        return;
      }
      setPromoError(r.message);
      setPromoItems([]);
      setPromoTotal(0);
      return;
    }
    setPromoItems(r.data.items ?? []);
    setPromoTotal(r.data.total ?? 0);
    setPromoPage(1);
  }, [router]);

  const loadMorePromoProducts = useCallback(async () => {
    if (promoLoading || promoItems.length >= promoTotal) return;
    const nextPage = promoPage + 1;
    setPromoLoading(true);
    setPromoError(null);
    const params = new URLSearchParams({
      page: String(nextPage),
      page_size: "200",
    });
    const r = await authenticatedFetchJson<MarketPromotionsProductsListResponse>(
      `/api/market/promotions/products?${params}`
    );
    setPromoLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setPromoError(r.message);
      return;
    }
    const chunk = r.data.items ?? [];
    setPromoItems((prev) => [...prev, ...chunk]);
    setPromoPage(nextPage);
  }, [promoLoading, promoItems.length, promoTotal, promoPage, router]);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    void loadPromoProducts();
  }, [loadPromoProducts]);

  const nextOrder = useMemo(() => {
    if (banners.length === 0) return 0;
    return Math.max(...banners.map((b) => b.order ?? 0)) + 1;
  }, [banners]);

  async function runDelete() {
    if (deleteId == null) return;
    setDeleteLoading(true);
    setError(null);
    const r1 = await authenticatedFetchJson<MarketBannerDeleteRequestResponse>(
      `/api/market/banners/${deleteId}/delete/request`,
      { method: "POST" }
    );
    if (!r1.ok) {
      setDeleteLoading(false);
      if (r1.unauthorized) router.replace("/");
      else setError(r1.message);
      return;
    }
    const r2 = await authenticatedFetchJson<{ success: boolean }>(
      `/api/market/banners/${deleteId}/delete/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_token: r1.data.approval_token }),
      }
    );
    setDeleteLoading(false);
    if (!r2.ok) {
      if (r2.unauthorized) router.replace("/");
      else setError(r2.message);
      return;
    }
    setDeleteId(null);
    await loadBanners();
  }

  async function requestPromoRemove(productId: number) {
    setPromoRemoveRequestingId(productId);
    setError(null);
    const r = await authenticatedFetchJson<MarketPromotionRemoveRequestResponse>(
      `/api/market/promotions/products/${productId}/remove/request`,
      { method: "POST" }
    );
    setPromoRemoveRequestingId(null);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    setDeletePromoId(productId);
    setDeletePromoToken(r.data.approval_token);
  }

  async function confirmPromoRemove() {
    if (deletePromoId == null || deletePromoToken == null) return;
    setDeletePromoLoading(true);
    setError(null);
    const body: MarketPromotionRemoveConfirmBody = {
      approval_token: deletePromoToken,
    };
    const r = await authenticatedFetchJson<MarketPromotionRemoveConfirmResponse>(
      `/api/market/promotions/products/${deletePromoId}/remove/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setDeletePromoLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    setDeletePromoId(null);
    setDeletePromoToken(null);
    await loadPromoProducts();
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f5f5f7]">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-[#e3e3e8] bg-white px-8 pb-5 pt-8">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
            Баннеры и акции
          </h1>
          <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-[#6e6e6e]">
            Управление баннерами главной страницы и акционными товарами.
          </p>
        </div>
      </header>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-8 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-8">
        <section className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-[18px] font-bold text-[#0a0a0a]">Баннеры</h2>
          <p className="mt-1 text-[13px] text-[#8a8a8a]">
            Рекомендуемый размер 950 × 410 px
          </p>
          <div className="relative mt-6 min-h-[120px]">
            {loading ? (
              <p className="text-[14px] text-[#8a8a8a]">Загрузка…</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [-webkit-overflow-scrolling:touch]">
                {banners.map((b) => (
                  <BannerCard
                    key={b.id}
                    banner={b}
                    onEdit={() => {
                      setEditing(b);
                      setEditorMode("edit");
                      setEditorOpen(true);
                    }}
                    onDelete={() => setDeleteId(b.id)}
                  />
                ))}
                {banners.length === 0 ? (
                  <p className="text-[14px] text-[#8a8a8a]">Пока нет баннеров</p>
                ) : null}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setEditorMode("create");
              setEditorOpen(true);
            }}
            className="mt-6 flex w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl bg-[#006c6b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#005a59]"
          >
            <IconPlus />
            Добавить новый баннер
          </button>
        </section>

        <section className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[18px] font-bold text-[#0a0a0a]">
                Акционные товары
              </h2>
              <p className="mt-1 text-[13px] text-[#8a8a8a]">
                Список и скидки
              </p>
              {promoError ? (
                <p className="mt-1 max-w-xl text-[12px] text-amber-800">{promoError}</p>
              ) : null}
            </div>
            <Link
              href="/dashboard/market/products"
              className="text-[13px] font-medium text-[#006c6b] hover:underline"
            >
              Все товары →
            </Link>
          </div>
          <div className="relative mt-6">
            {promoLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 text-[14px] text-[#6e6e6e]">
                Загрузка…
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => {
                  setPromoPickerSession((s) => s + 1);
                  setCandidatesOpen(true);
                }}
                className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d0d0d4] bg-white px-4 py-8 text-center transition hover:border-[#9ca3af]"
              >
                <IconPlus />
                <p className="mt-3 text-[14px] font-semibold text-[#0a0a0a]">
                  Добавить товар в категорию
                </p>
              </button>
              {promoItems.map((p) => (
                <PromotionProductCard
                  key={p.product_id}
                  product={p}
                  deleteBusy={promoRemoveRequestingId === p.product_id}
                  onOpen={() => {
                    setPromoEditorMode("edit");
                    setPromoEditId(p.product_id);
                    setPromoCandidate(null);
                    setPromoEditorOpen(true);
                  }}
                  onDelete={() => void requestPromoRemove(p.product_id)}
                />
              ))}
            </div>
            {promoItems.length < promoTotal ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={promoLoading}
                  onClick={() => void loadMorePromoProducts()}
                  className="rounded-2xl border border-[#e8e8ec] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#006c6b] hover:bg-[#f5f5f7] disabled:opacity-50"
                >
                  {promoLoading ? "Загрузка…" : "Показать ещё"}
                </button>
              </div>
            ) : null}
          </div>
          {!promoLoading && promoItems.length === 0 && !promoError ? (
            <p className="mt-4 text-center text-[14px] text-[#8a8a8a]">
              Нет акционных товаров
            </p>
          ) : null}
        </section>
      </div>

      <BannerEditorModal
        open={editorOpen}
        mode={editorMode}
        initial={editing}
        nextOrder={nextOrder}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSaved={() => void loadBanners()}
      />

      <DeleteBannerModal
        open={deleteId != null}
        loading={deleteLoading}
        onClose={() => !deleteLoading && setDeleteId(null)}
        onConfirmRemove={() => void runDelete()}
      />

      <CandidatesPickerModal
        key={promoPickerSession}
        open={candidatesOpen}
        onClose={() => setCandidatesOpen(false)}
        onPick={(c) => {
          setCandidatesOpen(false);
          setPromoEditorMode("add");
          setPromoCandidate(c);
          setPromoEditId(null);
          setPromoEditorOpen(true);
        }}
      />

      <PromotionProductEditorModal
        open={promoEditorOpen}
        mode={promoEditorMode}
        candidate={promoCandidate}
        editProductId={promoEditId}
        onClose={() => {
          setPromoEditorOpen(false);
          setPromoCandidate(null);
          setPromoEditId(null);
        }}
        onSaved={() => void loadPromoProducts()}
      />

      <DeletePromoProductModal
        open={deletePromoId != null && deletePromoToken != null}
        loading={deletePromoLoading}
        onClose={() => {
          if (!deletePromoLoading) {
            setDeletePromoId(null);
            setDeletePromoToken(null);
          }
        }}
        onConfirmRemove={() => void confirmPromoRemove()}
      />
    </div>
  );
}
