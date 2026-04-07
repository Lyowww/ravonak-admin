"use client";

import {
  displayProductExternalId,
  formatProductUsd,
  formatProductUzs,
} from "@/lib/market-category-utils";
import { resolveMediaUrl } from "@/lib/media-url";
import type { MarketProductItem } from "@/types/market-products-api";

function promoFlags(p: MarketProductItem): {
  any: boolean;
  uzs: boolean;
  usd: boolean;
} {
  const u = p.promo_price_uzs;
  const d = p.promo_price_usd;
  const uzs = u != null && Number.isFinite(u) && u < p.price_uzs;
  const usd = d != null && Number.isFinite(d) && d < p.price_usd;
  return { any: uzs || usd, uzs, usd };
}

export function ProductCard({
  product,
  onClick,
}: {
  product: MarketProductItem;
  onClick: () => void;
}) {
  const img = product.image_url?.trim();
  const imgSrc = img ? resolveMediaUrl(img) : "";
  const { any: promo, uzs: promoUzs, usd: promoUsd } = promoFlags(product);
  const saleUzs = promoUzs ? product.promo_price_uzs! : product.price_uzs;
  const saleUsd = promoUsd ? product.promo_price_usd! : product.price_usd;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col rounded-2xl border border-[#e8e8ec] bg-white p-4 text-left shadow-sm transition hover:border-[#d0d0d4]"
    >
      <p className="text-[12px] text-[#8a8a8a]">
        ID {displayProductExternalId(product)}
      </p>
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
        {product.name}
      </p>
      <div className="mt-3 space-y-1.5 border-t border-[#ececee] pt-3 text-[14px] font-semibold">
        {promo ? (
          <div className="flex items-stretch justify-between gap-2 text-[13px] text-[#9ca3af] line-through decoration-[#b0b0b0]">
            <span>{formatProductUzs(product.price_uzs)}</span>
            <span className="w-px shrink-0 bg-[#e8e8e8]" aria-hidden />
            <span>{formatProductUsd(product.price_usd)}</span>
          </div>
        ) : null}
        <div className="flex items-stretch justify-between gap-2">
          <span className={promoUzs ? "text-[#c62828]" : "text-[#0a0a0a]"}>
            {formatProductUzs(saleUzs)}
          </span>
          <span className="w-px shrink-0 bg-[#e0e0e0]" aria-hidden />
          <span className={promoUsd ? "text-[#c62828]" : "text-[#0a0a0a]"}>
            {formatProductUsd(saleUsd)}
          </span>
        </div>
      </div>
    </button>
  );
}
