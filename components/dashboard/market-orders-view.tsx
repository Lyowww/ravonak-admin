"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneDisplay, mapApiItemToOrderDetail } from "@/lib/map-market-order-detail";
import { marketOrdersFetchJson } from "@/lib/market-orders-client";
import type {
  MarketOrderApiItem,
  MarketOrderDetailResponse,
  MarketOrdersListResponse,
} from "@/types/market-api-orders";
import type { OrderDetail } from "@/types/market-order";

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevronOrder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconPhoneSmall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="currentColor"
      />
    </svg>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

function OrderCard({
  order,
  selected,
  onSelect,
}: {
  order: MarketOrderApiItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-stretch gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
        selected
          ? "border-[#d8d8dc] bg-[#ebebed]"
          : "border-[#e8e8ec] bg-[#f5f5f7] hover:bg-[#efeff2]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-[#0a0a0a]">№ {order.order_number}</p>
        <p className="mt-1 text-[14px] text-[#8a8a8a]">{order.customer_name}</p>
        <p className="mt-0.5 text-[13px] text-[#8a8a8a]">
          {formatPhoneDisplay(order.customer_phone)}
        </p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl bg-[#2a2a2e] text-white">
        <IconChevronOrder className="h-5 w-5" />
      </span>
    </button>
  );
}

function PersonBlock({
  label,
  name,
  phone,
}: {
  label: string;
  name: string;
  phone: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-medium text-[#8a8a8a]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">{name}</p>
      <div className="mt-2 flex items-center gap-2">
        <IconPhoneSmall className="h-4 w-4 shrink-0 text-[#8a8a8a]" />
        <span className="text-[14px] text-[#3a3a3a]">{phone}</span>
        <button
          type="button"
          onClick={() => void copyText(phone.replace(/\s/g, ""))}
          className="rounded-md p-1 text-[#8a8a8a] transition hover:bg-black/5 hover:text-[#0a0a0a]"
          aria-label="Копировать телефон"
        >
          <IconCopy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StaffBlock({
  label,
  name,
  id,
}: {
  label: string;
  name: string;
  id: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-medium text-[#8a8a8a]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">{name}</p>
      <p className="mt-1 text-[13px] text-[#8a8a8a]">ID {id}</p>
    </div>
  );
}

function OrderDetailPanel({
  detail,
  onDeleteClick,
}: {
  detail: OrderDetail;
  onDeleteClick: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-[#ececee] px-8 pb-6 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <label className="text-[13px] font-medium text-[#8a8a8a]">
              Оставить комментарий к заказу
            </label>
            <textarea
              placeholder="Введите текст"
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#b0b0b0] outline-none focus:border-[#d0d0d4]"
            />
          </div>
          <button
            type="button"
            onClick={onDeleteClick}
            className="shrink-0 rounded-xl bg-[#ef4444] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#dc2626]"
          >
            Удалить заказ
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ececee] pb-5">
          <h3 className="text-[20px] font-bold text-[#0a0a0a]">Заказ</h3>
          <span className="text-[15px] font-medium text-[#6e6e6e]">
            {detail.createdAtLabel}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[17px] font-bold text-[#0a0a0a]">№ {detail.number}</span>
          <button
            type="button"
            onClick={() => void copyText(detail.number)}
            className="rounded-md p-1 text-[#8a8a8a] hover:bg-black/5"
            aria-label="Копировать номер"
          >
            <IconCopy className="h-4 w-4" />
          </button>
          <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium text-[#3a3a3a]">
            <span
              className={`h-2 w-2 rounded-full ${
                detail.statusVariant === "processing"
                  ? "bg-[#9ca3af]"
                  : detail.statusVariant === "completed"
                    ? "bg-[#22c55e]"
                    : "bg-[#9ca3af]"
              }`}
            />
            {detail.statusLabel}
          </span>
        </div>

        <div className="mt-8 grid gap-8 border-b border-[#ececee] pb-8 md:grid-cols-2">
          <PersonBlock
            label="Заказчик"
            name={detail.customer.name}
            phone={detail.customer.phone}
          />
          <PersonBlock
            label="Получатель"
            name={detail.recipient.name}
            phone={detail.recipient.phone}
          />
        </div>

        <div className="mt-8 grid gap-8 border-b border-[#ececee] pb-8 md:grid-cols-2">
          <StaffBlock
            label="Сборщик"
            name={detail.picker.name}
            id={detail.picker.id}
          />
          <StaffBlock
            label="Курьер"
            name={detail.courier.name}
            id={detail.courier.id}
          />
        </div>

        <div className="mt-8 border-b border-[#ececee] pb-8">
          <p className="text-[13px] font-medium text-[#8a8a8a]">Адрес доставки</p>
          <div className="mt-2 flex items-start gap-2">
            <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-[#0a0a0a]">
              {detail.address}
            </p>
            <button
              type="button"
              onClick={() => void copyText(detail.address)}
              className="shrink-0 rounded-md p-1 text-[#8a8a8a] hover:bg-black/5"
              aria-label="Копировать адрес"
            >
              <IconCopy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-[17px] font-bold text-[#0a0a0a]">Товары в заказе</h4>
            <p className="text-[15px] font-semibold text-[#0a0a0a]">
              {detail.itemsTotalUzs} сум / {detail.itemsTotalUsd} $
            </p>
          </div>
          <ul className="mt-4 space-y-4">
            {detail.items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-2xl border border-[#ececee] bg-[#fafafa] p-4"
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug text-[#0a0a0a]">
                    {item.title}
                  </p>
                  {item.qtyLabel ? (
                    <p className="mt-1 text-[13px] text-[#8a8a8a]">{item.qtyLabel}</p>
                  ) : null}
                  <p className="mt-2 text-[14px] font-medium text-[#0a0a0a]">
                    {item.priceUzs} сум / {item.priceUsd} $
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DeleteOrderModal({
  open,
  loading,
  onClose,
  onConfirmDelete,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="relative w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-order-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#9ca3af] transition hover:bg-black/5 hover:text-[#0a0a0a] disabled:opacity-50"
          aria-label="Закрыть"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fee2e2]">
          <span className="text-3xl font-bold text-[#ef4444]">!</span>
        </div>

        <h2
          id="delete-order-title"
          className="mt-5 text-center text-[20px] font-bold text-[#0a0a0a]"
        >
          Внимание !
        </h2>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-[#8a8a8a]">
          Вы действительно хотите удалить заказ ?
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-[#e8e8ec] bg-[#f5f5f7] py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[#ececee] disabled:opacity-50"
          >
            Оставить
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#0f766e] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-60"
          >
            {loading ? "Удаление…" : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketOrdersView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listItems, setListItems] = useState<MarketOrderApiItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: "1", page_size: "100" });
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    const r = await marketOrdersFetchJson<MarketOrdersListResponse>(
      `/api/market/orders?${params.toString()}`
    );
    setListLoading(false);
    if (!r.ok) {
      if (r.unauthorized) {
        router.replace("/");
        return;
      }
      setError(r.message);
      setListItems([]);
      return;
    }
    setListItems(r.data.items);
  }, [debouncedSearch, router]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (listItems.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev == null) return listItems[0].order_id;
      if (listItems.some((x) => x.order_id === prev)) return prev;
      return listItems[0].order_id;
    });
  }, [listItems]);

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    let cancelled = false;
    async function run() {
      setDetailLoading(true);
      setDetailError(null);
      const r = await marketOrdersFetchJson<MarketOrderDetailResponse>(
        `/api/market/orders/${selectedId}`
      );
      if (cancelled) return;
      setDetailLoading(false);
      if (!r.ok) {
        if (r.unauthorized) {
          router.replace("/");
          return;
        }
        setDetailError(r.message);
        setDetail(null);
        return;
      }
      setDetail(
        mapApiItemToOrderDetail(
          r.data.item as MarketOrderApiItem & Record<string, unknown>
        )
      );
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedId, router]);

  const refresh = useCallback(() => {
    void loadList();
  }, [loadList]);

  const inProgress = listItems.filter((o) => o.status !== "completed");
  const completed = listItems.filter((o) => o.status === "completed");

  async function confirmDelete() {
    if (selectedId == null) return;
    setDeleteLoading(true);
    setError(null);
    const r1 = await marketOrdersFetchJson<{ approval_token: string }>(
      `/api/market/orders/${selectedId}/delete/request`,
      { method: "POST" }
    );
    if (!r1.ok) {
      setDeleteLoading(false);
      if (r1.unauthorized) router.replace("/");
      else setError(r1.message);
      return;
    }
    const r2 = await marketOrdersFetchJson<{ success: boolean }>(
      `/api/market/orders/${selectedId}/delete/confirm`,
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
    setDeleteOpen(false);
    setSelectedId(null);
    await loadList();
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#e3e3e8] px-8 pb-5 pt-8">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
          Заказы
        </h1>
        <button
          type="button"
          onClick={refresh}
          disabled={listLoading}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8ec] bg-[#f5f5f7] text-[#6b7280] transition hover:bg-[#ececee] hover:text-[#0a0a0a] disabled:opacity-50"
          aria-label="Обновить"
        >
          <IconRefresh className="h-5 w-5" />
        </button>
      </header>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-8 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex w-full max-w-[440px] shrink-0 flex-col border-r border-[#e8e8ec] bg-[#fafafa]">
          {listLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-[14px] text-[#6e6e6e]">
              Загрузка…
            </div>
          ) : null}
          <div className="shrink-0 px-6 pb-4 pt-5">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск заказа"
              className="w-full rounded-2xl border-0 bg-[#e9ecef] px-4 py-3.5 text-[15px] text-[#0a0a0a] placeholder:text-[#8a8a8a] outline-none ring-0 focus:bg-[#e3e7eb]"
            />
          </div>
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 pb-10">
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-[#0a0a0a]">
                В работе
              </h2>
              <div className="space-y-3">
                {inProgress.map((o) => (
                  <OrderCard
                    key={o.order_id}
                    order={o}
                    selected={selectedId === o.order_id}
                    onSelect={() => setSelectedId(o.order_id)}
                  />
                ))}
                {inProgress.length === 0 ? (
                  <p className="text-[14px] text-[#8a8a8a]">Нет заказов</p>
                ) : null}
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-[#0a0a0a]">
                Завершенные
              </h2>
              <div className="space-y-3">
                {completed.map((o) => (
                  <OrderCard
                    key={o.order_id}
                    order={o}
                    selected={selectedId === o.order_id}
                    onSelect={() => setSelectedId(o.order_id)}
                  />
                ))}
                {completed.length === 0 ? (
                  <p className="text-[14px] text-[#8a8a8a]">Нет заказов</p>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
          {detailLoading ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-[15px] text-[#8a8a8a]">
              Загрузка…
            </div>
          ) : detailError ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 px-8 text-center text-[15px] text-red-700">
              {detailError}
            </div>
          ) : detail ? (
            <OrderDetailPanel
              detail={detail}
              onDeleteClick={() => setDeleteOpen(true)}
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center px-8 text-center text-[15px] text-[#8a8a8a]">
              Выберите заказ в списке
            </div>
          )}
        </div>
      </div>

      <DeleteOrderModal
        open={deleteOpen}
        loading={deleteLoading}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirmDelete={() => void confirmDelete()}
      />
    </div>
  );
}
