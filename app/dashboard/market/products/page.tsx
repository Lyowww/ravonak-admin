import { Suspense } from "react";
import { MarketProductsView } from "@/components/dashboard/market-products-view";

export default function MarketProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-[#6e6e6e]">
          Загрузка…
        </div>
      }
    >
      <MarketProductsView />
    </Suspense>
  );
}
