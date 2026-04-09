"use client";

import { formatProductUsd, formatProductUzs } from "@/lib/market-category-utils";
import { resolveMediaUrl } from "@/lib/media-url";
import type { MarketPromotionProductItem } from "@/types/market-promotions-api";

function IconTrashPromo() {
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

export function PromotionProductCard({
  product,
  onOpen,
  onDelete,
  deleteBusy,
}: {
  product: MarketPromotionProductItem;
  onOpen: () => void;
  onDelete: () => void;
  deleteBusy?: boolean;
}) {
  const img = product.image_url?.trim();
  const imgSrc = img ? resolveMediaUrl(img) : "";
  return (
    <div className="relative">
      <button
        type="button"
        disabled={deleteBusy}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#d32f2f] text-white shadow-md transition hover:bg-[#b71c1c] disabled:opacity-50"
        aria-label="Удалить из акции"
      >
        {deleteBusy ? (
          <span className="text-[11px] font-bold">…</span>
        ) : (
          <IconTrashPromo />
        )}
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col rounded-2xl border border-[#e8e8ec] bg-white p-4 text-left shadow-sm transition hover:border-[#d0d0d4]"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] text-[#8a8a8a]">ID {product.product_id}</p>
          <span className="shrink-0 rounded-full bg-[#e8f5f5] px-2.5 py-0.5 text-[11px] font-bold text-[#006c6b]">
            −{Math.round(product.discount_percentage)}%
          </span>
        </div>
        <div className="mt-3 flex flex-1 items-center justify-center overflow-hidden rounded-xl">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt=""
              className="max-h-60 w-auto max-w-full object-contain"
            />
          ) : (
            <span className="text-[13px] text-[#b0b0b0]">Нет фото</span>
          )}
        </div>
        <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-[14px] font-semibold leading-snug text-[#0a0a0a]">
          {product.product_name}
        </p>
        <div className="mt-3 space-y-1.5 border-t border-[#ececee] pt-3 text-[14px] font-semibold">
          <div className="flex items-stretch justify-between gap-2 text-[13px] text-[#9ca3af] line-through decoration-[#b0b0b0]">
            <span>{formatProductUzs(product.price_uzs)}</span>
            <span className="w-px shrink-0 bg-[#e8e8e8]" aria-hidden />
            <span>{formatProductUsd(product.price_usd)}</span>
          </div>
          <div className="flex items-stretch justify-between gap-2">
            <span className="text-[#c62828]">
              {formatProductUzs(product.discounted_price_uzs)}
            </span>
            <span className="w-px shrink-0 bg-[#e0e0e0]" aria-hidden />
            <span className="text-[#c62828]">
              {formatProductUsd(product.discounted_price_usd)}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
