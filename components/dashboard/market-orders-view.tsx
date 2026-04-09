"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  formatPhoneDisplay,
  mapApiItemToOrderDetail,
  pickMarketUserIdFromOrderExtra,
} from "@/lib/map-market-order-detail";
import {
  formatBalanceUsd,
  formatTelegramDisplay,
  formatUserDateTime,
} from "@/lib/market-users-format";
import { marketOrdersFetchJson } from "@/lib/market-orders-client";
import type {
  MarketOrderApiItem,
  MarketOrderDetailResponse,
  MarketOrdersListResponse,
} from "@/types/market-api-orders";
import type { OrderDetail } from "@/types/market-order";
import type {
  MarketUserDetailResponse,
  MarketUserItem,
} from "@/types/market-users-api";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

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

const LIST_ORDER_CUSTOMER_USER_KEYS = [
  "customer_id",
  "user_id",
  "buyer_id",
  "client_id",
  "customer_user_id",
] as const;

function listOrderCustomerUserId(order: MarketOrderApiItem): number | null {
  return pickMarketUserIdFromOrderExtra(
    order as MarketOrderApiItem & Record<string, unknown>,
    LIST_ORDER_CUSTOMER_USER_KEYS,
  );
}

function OrderCard({
  order,
  selected,
  onSelect,
  muted = false,
  customerUserId,
  onOpenUser,
}: {
  order: MarketOrderApiItem;
  selected: boolean;
  onSelect: () => void;
  customerUserId: number | null;
  onOpenUser: (userId: number) => void;
  /** Completed / archived — softer, more transparent treatment */
  muted?: boolean;
}) {
  const cardClass = muted
    ? selected
      ? "border-[#ececec] bg-[#ebebed]"
      : "border-[#ececec]/80 bg-white/80 hover:bg-[#f3f3f4]"
    : selected
      ? "border-[#ececec] bg-[#ebebed]"
      : "border-[#ececec] bg-white hover:bg-[#f6f6f7]";

  return (
    <div
      className={`flex w-full items-stretch gap-0 rounded-2xl border shadow-[0_1px_0_rgba(0,0,0,0.03)] transition ${cardClass} ${muted ? "opacity-90 hover:opacity-100" : ""}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]/15 focus-visible:ring-offset-2"
      >
        <p
          className={`text-[15px] font-bold ${muted ? "text-[#8b8b90]" : "text-[#0a0a0a]"}`}
        >
          № {order.order_number}
        </p>
        <p
          className={`mt-1 text-[14px] ${muted ? "text-[#b4b4ba]" : "text-[#8a8a8a]"}`}
        >
          {order.customer_name}
        </p>
        <p
          className={`mt-0.5 text-[13px] ${muted ? "text-[#b8b8be]" : "text-[#8a8a8a]"}`}
        >
          {formatPhoneDisplay(order.customer_phone)}
        </p>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (customerUserId != null) onOpenUser(customerUserId);
          else onSelect();
        }}
        className={`mr-3 flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl text-white transition hover:opacity-90 ${muted ? "bg-[#2a2a2e]/30" : "bg-[#2a2a2e]"}`}
        aria-label={
          customerUserId != null
            ? "Информация о пользователе"
            : "Выбрать заказ"
        }
      >
        <IconChevronOrder
          className={`h-5 w-5 ${muted ? "opacity-60" : ""}`}
        />
      </button>
    </div>
  );
}

function PersonBlock({
  label,
  name,
  phone,
  userId,
  onOpenUser,
}: {
  label: string;
  name: string;
  phone: string;
  userId: number | null;
  onOpenUser: (userId: number) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch gap-3 rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#8a8a8a]">{label}</p>
        <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">{name}</p>
        <div className="mt-2 flex items-center gap-2">
          <IconPhoneSmall className="h-4 w-4 shrink-0 text-[#8a8a8a]" />
          <span className="text-[14px] text-[#3a3a3a]">{phone}</span>
          <button
            type="button"
            onClick={() => void copyToClipboard(phone.replace(/\s/g, ""))}
            className="rounded-md p-1 text-[#8a8a8a] transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
            aria-label="Копировать телефон"
          >
            <IconCopy className="h-4 w-4" />
          </button>
        </div>
      </div>
      <button
        type="button"
        disabled={userId == null}
        title={
          userId == null
            ? "ID пользователя недоступен в данных заказа"
            : "Информация о пользователе"
        }
        onClick={() => userId != null && onOpenUser(userId)}
        className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl bg-[#2a2a2e] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Информация о пользователе"
      >
        <IconChevronOrder className="h-5 w-5" />
      </button>
    </div>
  );
}

function StaffBlock({
  label,
  name,
  id,
  userId,
  onOpenUser,
}: {
  label: string;
  name: string;
  id: string;
  userId: number | null;
  onOpenUser: (userId: number) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch gap-3 rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#8a8a8a]">{label}</p>
        <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">{name}</p>
        <p className="mt-1 text-[13px] text-[#8a8a8a]">ID {id}</p>
      </div>
      {userId != null ? (
        <button
          type="button"
          onClick={() => onOpenUser(userId)}
          className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl bg-[#2a2a2e] text-white transition hover:opacity-90"
          aria-label="Информация о пользователе"
        >
          <IconChevronOrder className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

function OrderDetailPanel({
  detail,
  orderId,
  onDeleteClick,
  onOpenUser,
  onSaveComment,
}: {
  detail: OrderDetail;
  orderId: number;
  onDeleteClick: () => void;
  onOpenUser: (userId: number) => void;
  onSaveComment: (comment: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(detail.adminComment);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(detail.adminComment);
  }, [detail.id, detail.adminComment]);

  async function handleSaveComment() {
    if (saving) return;
    setSaving(true);
    try {
      await onSaveComment(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-[#ececec] px-8 pb-6 pt-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-end sm:gap-4">
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`order-admin-comment-${orderId}`}
              className="text-[13px] font-medium text-[#8a8a8a]"
            >
              Оставить комментарий к заказу
            </label>
            <input
              id={`order-admin-comment-${orderId}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Введите текст"
              className="mt-2 w-full resize-y rounded-2xl border-0 bg-[#efeff0] px-4 py-3.5 text-[14px] text-[#0a0a0a] placeholder:text-[#a8a8ae] outline-none ring-0 focus:bg-[#e8e8ea]"
            />
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
            <button
              type="button"
              onClick={() => void handleSaveComment()}
              disabled={saving}
              className="rounded-2xl bg-[#2a2a2e] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={onDeleteClick}
              className="rounded-2xl bg-[#ff4d4d] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#e64444]"
            >
              Удалить заказ
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-[20px] font-bold text-[#0a0a0a]">Заказ</h3>
          <span className="text-[14px] font-medium text-[#8a8a8a]">
            {detail.createdAtLabel}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[13px] font-medium text-[#8a8a8a]">
                Номер заказа
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[17px] font-bold text-[#0a0a0a]">
                  № {detail.number}
                </span>
                <button
                  type="button"
                  onClick={() => void copyToClipboard(detail.number)}
                  className="rounded-lg p-1.5 text-[#8a8a8a] transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
                  aria-label="Копировать номер"
                >
                  <IconCopy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#8a8a8a]">
                Статус заказа
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${detail.statusVariant === "processing"
                    ? "bg-[#9ca3af]"
                    : detail.statusVariant === "completed"
                      ? "bg-[#22c55e]"
                      : "bg-[#9ca3af]"
                    }`}
                />
                <span className="text-[15px] font-semibold text-[#0a0a0a]">
                  {detail.statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PersonBlock
            label="Заказчик"
            name={detail.customer.name}
            phone={detail.customer.phone}
            userId={detail.customerUserId}
            onOpenUser={onOpenUser}
          />
          <PersonBlock
            label="Получатель"
            name={detail.recipient.name}
            phone={detail.recipient.phone}
            userId={detail.recipientUserId}
            onOpenUser={onOpenUser}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StaffBlock
            label="Сборщик"
            name={detail.picker.name}
            id={detail.picker.id}
            userId={detail.pickerUserId}
            onOpenUser={onOpenUser}
          />
          <StaffBlock
            label="Курьер"
            name={detail.courier.name}
            id={detail.courier.id}
            userId={detail.courierUserId}
            onOpenUser={onOpenUser}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <p className="text-[13px] font-medium text-[#8a8a8a]">
            Адрес доставки
          </p>
          <div className="mt-3 flex items-start gap-3">
            <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-[#0a0a0a]">
              {detail.address}
            </p>
            <button
              type="button"
              onClick={() => void copyToClipboard(detail.address)}
              className="shrink-0 rounded-lg p-1.5 text-[#8a8a8a] transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
              aria-label="Копировать адрес"
            >
              <IconCopy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-[17px] font-bold text-[#0a0a0a]">
              Товары в заказе
            </h4>
            <p className="text-[15px] font-semibold text-[#0a0a0a]">
              {detail.itemsTotalUzs} сум / {detail.itemsTotalUsd} $
            </p>
          </div>
          <ul className="mt-4 space-y-3">
            {detail.items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
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
                    <p className="mt-1 text-[13px] text-[#8a8a8a]">
                      {item.qtyLabel}
                    </p>
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

function UserInfoModal({
  open,
  userId,
  onClose,
}: {
  open: boolean;
  userId: number | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [item, setItem] = useState<MarketUserItem | null>(null);

  useEffect(() => {
    if (!open || userId == null) {
      setItem(null);
      setErr(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErr(null);
      const r = await marketOrdersFetchJson<MarketUserDetailResponse>(
        `/api/market/users/${userId}`
      );
      if (cancelled) return;
      setLoading(false);
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        else setErr(r.message);
        setItem(null);
        return;
      }
      setItem(r.data.item);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [open, userId, router]);

  if (!open || userId == null) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="relative max-h-[min(90vh,640px)] w-full max-w-[420px] overflow-y-auto rounded-3xl border border-[#ececec] bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#9ca3af] transition hover:bg-black/5 hover:text-[#0a0a0a]"
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

        <h2
          id="user-info-title"
          className="pr-10 text-[18px] font-bold text-[#0a0a0a]"
        >
          Пользователь
        </h2>
        <p className="mt-1 text-[13px] text-[#8a8a8a]">ID {userId}</p>

        {loading ? (
          <p className="mt-8 text-center text-[14px] text-[#8a8a8a]">
            Загрузка…
          </p>
        ) : err ? (
          <p className="mt-8 text-center text-[14px] text-red-700">{err}</p>
        ) : item ? (
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-[12px] font-medium text-[#8a8a8a]">
                Имя
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-[#0a0a0a]">
                {item.full_name}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8a8a8a]">
                Телефон
              </dt>
              <dd className="mt-1 text-[15px] text-[#0a0a0a]">
                {item.phone_number}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8a8a8a]">
                Telegram
              </dt>
              <dd className="mt-1 text-[15px] text-[#0a0a0a]">
                {formatTelegramDisplay(item.telegram_username)} · tg_id{" "}
                {item.tg_id}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8a8a8a]">
                Баланс
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-[#0a0a0a]">
                {formatBalanceUsd(item.balance_usd)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8a8a8a]">
                Регистрация
              </dt>
              <dd className="mt-1 text-[14px] text-[#3a3a3a]">
                {formatUserDateTime(item.registered_at)}
              </dd>
            </div>
          </dl>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-2xl border border-[#ececec] bg-[#efeff0] py-3 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[#e4e4e6]"
        >
          Закрыть
        </button>
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
        className="relative w-full max-w-[400px] rounded-3xl border border-[#ececec] bg-white p-8 shadow-xl"
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
            className="flex-1 rounded-2xl border border-[#ececec] bg-[#efeff0] py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[#e4e4e6] disabled:opacity-50"
          >
            Оставить
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#0f766e] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-60"
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
  const [refreshSpinKey, setRefreshSpinKey] = useState(0);
  const [userInfoOpen, setUserInfoOpen] = useState(false);
  const [userInfoId, setUserInfoId] = useState<number | null>(null);

  const openUserInfo = useCallback((id: number) => {
    setUserInfoId(id);
    setUserInfoOpen(true);
  }, []);

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
          r.data.item as MarketOrderApiItem & Record<string, unknown>,
          r.data.products,
          r.data.admin_comment,
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

  const saveAdminComment = useCallback(
    async (comment: string) => {
      if (selectedId == null) return;
      const trimmed = comment.trim();
      const r = await marketOrdersFetchJson<{ success: boolean; message: string }>(
        `/api/market/orders/${selectedId}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: trimmed }),
        }
      );
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        else toast.error(r.message);
        return;
      }
      setDetail((d) => (d ? { ...d, adminComment: trimmed } : d));
      toast.success(r.data.message || "Комментарий сохранён");
    },
    [selectedId, router]
  );

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
    <div className="flex min-h-full flex-col bg-[#f8f8f8]">
      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-8 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex w-full max-w-[440px] shrink-0 flex-col border-r border-[#ececec] bg-[#f8f8f8]">
          {listLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f8f8f8]/75 text-[14px] text-[#6e6e6e]">
              Загрузка…
            </div>
          ) : null}
          <header className="flex shrink-0 flex-wrap items-center gap-3 px-6 pb-4 pt-8">
            <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
              Заказы
            </h1>
            <button
              type="button"
              onClick={() => {
                setRefreshSpinKey((k) => k + 1);
                refresh();
              }}
              disabled={listLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efeff0] text-[#3a3a3a] transition hover:bg-[#e4e4e6] disabled:opacity-50"
              aria-label="Обновить"
            >
              <span
                key={refreshSpinKey}
                className={`inline-flex items-center justify-center ${refreshSpinKey > 0 ? "market-orders-refresh-icon-spin" : ""
                  }`}
              >
                <IconRefresh className="h-[18px] w-[18px]" />
              </span>
            </button>
          </header>
          <div className="shrink-0 px-6 pb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск заказа"
              className="w-full rounded-2xl border-0 bg-[#efeff0] px-4 py-3.5 text-[15px] text-[#0a0a0a] placeholder:text-[#8a8a8a] outline-none ring-0 focus:bg-[#e8e8ea]"
            />
          </div>
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 pb-10">
            <section>
              <h2 className="mb-3 text-[14px] font-semibold text-[#a8a8ae]">
                В работе
              </h2>
              <div className="space-y-3">
                {inProgress.map((o) => (
                  <OrderCard
                    key={o.order_id}
                    order={o}
                    selected={selectedId === o.order_id}
                    customerUserId={listOrderCustomerUserId(o)}
                    onOpenUser={openUserInfo}
                    onSelect={() => setSelectedId(o.order_id)}
                  />
                ))}
                {inProgress.length === 0 ? (
                  <p className="text-[14px] text-[#8a8a8a]">Нет заказов</p>
                ) : null}
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-[#a8a8ae]">
                Завершенные
              </h2>
              <div className="space-y-3">
                {completed.map((o) => (
                  <OrderCard
                    key={o.order_id}
                    order={o}
                    selected={selectedId === o.order_id}
                    customerUserId={listOrderCustomerUserId(o)}
                    onOpenUser={openUserInfo}
                    muted
                    onSelect={() => setSelectedId(o.order_id)}
                  />
                ))}
                {completed.length === 0 ? (
                  <p className="text-[14px] text-[#b8b8be]">Нет заказов</p>
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
          ) : detail && selectedId != null ? (
            <OrderDetailPanel
              detail={detail}
              orderId={selectedId}
              onDeleteClick={() => setDeleteOpen(true)}
              onOpenUser={openUserInfo}
              onSaveComment={saveAdminComment}
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center px-8 text-center text-[15px] text-[#8a8a8a]">
              Выберите заказ в списке
            </div>
          )}
        </div>
      </div>

      <UserInfoModal
        open={userInfoOpen}
        userId={userInfoId}
        onClose={() => {
          setUserInfoOpen(false);
          setUserInfoId(null);
        }}
      />

      <DeleteOrderModal
        open={deleteOpen}
        loading={deleteLoading}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirmDelete={() => void confirmDelete()}
      />
    </div>
  );
}
