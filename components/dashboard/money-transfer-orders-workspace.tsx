"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatTelegramDisplay, formatUserDate } from "@/lib/market-users-format";
import { formatMtDateTime, formatMtMoney } from "@/lib/mt-orders-format";
import type {
  MoneyTransferApprovalResponse,
  MoneyTransferCompleteConfirmBody,
  MoneyTransferOrderCreateBody,
  MoneyTransferOrderDetailResponse,
  MoneyTransferOrderItem,
  MoneyTransferOrderPatchBody,
  MoneyTransferOrdersListResponse,
  MoneyTransferTransfer,
} from "@/types/money-transfer-orders-api";
import { MtAddUserModal, MtUserDetailModal } from "@/components/dashboard/money-transfer-user-modals";
import type {
  MoneyTransferUserItem,
  MoneyTransferUsersListResponse,
} from "@/types/money-transfer-users-api";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
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

function IconChevron() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconPhone({ className }: { className?: string }) {
  return (
    <svg
      className={["h-4 w-4 shrink-0", className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
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

function MtOrderCard({
  order,
  selected,
  onSelect,
}: {
  order: MoneyTransferOrderItem;
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
        <p className="text-[15px] font-bold text-[#0a0a0a]">№ {order.order_code}</p>
        <p className="mt-1 text-[14px] text-[#8a8a8a]">{order.client_name}</p>
        <p className="mt-0.5 text-[13px] text-[#8a8a8a]">{order.client_phone}</p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl bg-[#2a2a2e] text-white">
        <IconChevron />
      </span>
    </button>
  );
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  loading,
  onClose,
  onConfirm,
  danger,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#9ca3af] hover:bg-black/5 disabled:opacity-50"
          aria-label="Закрыть"
        >
          <IconClose />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fee2e2]">
          <span className="text-3xl font-bold text-[#ef4444]">!</span>
        </div>
        <h2 className="mt-5 text-center text-[20px] font-bold text-[#0a0a0a]">{title}</h2>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-[#8a8a8a]">{message}</p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-[#e8e8ec] bg-[#f5f5f7] py-3.5 text-[15px] font-semibold text-[#0a0a0a] hover:bg-[#ececee] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className={`flex-1 rounded-xl py-3.5 text-[15px] font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-[#ef4444] hover:bg-[#dc2626]" : "bg-[#006c6b] hover:bg-[#005a59]"
            }`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function parseNum(s: string): number {
  const x = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(x) ? x : NaN;
}

type WorkspaceVariant = "current" | "history";

export function MoneyTransferOrdersWorkspace({ variant }: { variant: WorkspaceVariant }) {
  const router = useRouter();
  const listEndpoint =
    variant === "current"
      ? "/api/money-transfer/orders/current"
      : "/api/money-transfer/orders/history";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [collected, setCollected] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [listItems, setListItems] = useState<MoneyTransferOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MoneyTransferOrderDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [adminComment, setAdminComment] = useState("");
  const [startAmount, setStartAmount] = useState("");
  const [amountIls, setAmountIls] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [courseExchange, setCourseExchange] = useState("");

  const [patchSaving, setPatchSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"users" | "form">("users");
  const [userSearch, setUserSearch] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [users, setUsers] = useState<MoneyTransferUserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersRefreshKey, setUsersRefreshKey] = useState(0);
  const [pickedUser, setPickedUser] = useState<MoneyTransferUserItem | null>(null);
  const [cardUserId, setCardUserId] = useState<number | null>(null);
  const [addMtUserOpen, setAddMtUserOpen] = useState(false);
  const [cAddress, setCAddress] = useState("");
  const [cStartUsd, setCStartUsd] = useState("");
  const [cIls, setCIls] = useState("");
  const [cUsd, setCUsd] = useState("");
  const [cDelivery, setCDelivery] = useState("");
  const [cCommission, setCCommission] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUserSearch(userSearch), 400);
    return () => clearTimeout(t);
  }, [userSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, collected, variant]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize) || 1),
    [total, pageSize]
  );

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (variant === "current" && collected !== null) {
      params.set("collected", collected ? "true" : "false");
    }
    const r = await authenticatedFetchJson<MoneyTransferOrdersListResponse>(
      `${listEndpoint}?${params}`,
      { cache: "no-store" }
    );
    setListLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setListError(r.message);
      setListItems([]);
      setTotal(0);
      return;
    }
    setListItems(Array.isArray(r.data.items) ? r.data.items : []);
    setTotal(r.data.total ?? 0);
  }, [listEndpoint, page, pageSize, debouncedSearch, collected, variant, router]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (listItems.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev != null && listItems.some((x) => x.id === prev)) return prev;
      return listItems[0].id;
    });
  }, [listItems]);

  const syncFormFromItem = useCallback((item: MoneyTransferOrderItem) => {
    setAdminComment(item.admin_comment ?? "");
    setStartAmount(String(item.amount_start_usd ?? ""));
    setAmountIls(String(item.amount_ils ?? ""));
    setAmountUsd(String(item.amount_usd ?? ""));
    setCourseExchange(String(item.course_exchange ?? ""));
  }, []);

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
      const r = await authenticatedFetchJson<MoneyTransferOrderDetailResponse>(
        `/api/money-transfer/orders/${selectedId}`,
        { cache: "no-store" }
      );
      if (cancelled) return;
      setDetailLoading(false);
      if (!r.ok) {
        if (r.unauthorized) router.replace("/");
        else setDetailError(r.message);
        setDetail(null);
        return;
      }
      setDetail(r.data);
      syncFormFromItem(r.data.item);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedId, router, syncFormFromItem]);

  const item = detail?.item;
  const transfers = detail?.transfers ?? [];
  const readOnly =
    variant === "history" ||
    !item?.is_active ||
    item?.is_completed ||
    !item?.is_editable;

  const canComplete = variant === "current" && item?.is_active && !item?.is_completed;
  const canDelete = variant === "current" && item?.is_active && !item?.is_completed;

  async function savePatch() {
    if (!item || selectedId == null || readOnly) return;
    setPatchSaving(true);
    setActionError(null);
    const body: MoneyTransferOrderPatchBody = {
      admin_comment: adminComment,
      start_amount: parseNum(startAmount),
      amount_ils: parseNum(amountIls),
      amount_usd: parseNum(amountUsd),
      course_exchange: parseNum(courseExchange),
    };
    if (
      [body.start_amount, body.amount_ils, body.amount_usd, body.course_exchange].some(
        (n) => Number.isNaN(n as number)
      )
    ) {
      setActionError("Проверьте числовые поля");
      setPatchSaving(false);
      return;
    }
    const r = await authenticatedFetchJson<MoneyTransferOrderDetailResponse>(
      `/api/money-transfer/orders/${selectedId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setPatchSaving(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setActionError(r.message);
      return;
    }
    setDetail(r.data);
    syncFormFromItem(r.data.item);
    void loadList();
  }

  async function runDelete() {
    if (selectedId == null) return;
    setDeleteLoading(true);
    setActionError(null);
    const r1 = await authenticatedFetchJson<MoneyTransferApprovalResponse>(
      `/api/money-transfer/orders/${selectedId}/delete/request`,
      { method: "POST" }
    );
    if (!r1.ok) {
      setDeleteLoading(false);
      if (r1.unauthorized) router.replace("/");
      else setActionError(r1.message);
      return;
    }
    const r2 = await authenticatedFetchJson<{ success: boolean }>(
      `/api/money-transfer/orders/${selectedId}/delete/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_token: r1.data.approval_token }),
      }
    );
    setDeleteLoading(false);
    if (!r2.ok) {
      if (r2.unauthorized) router.replace("/");
      else setActionError(r2.message);
      return;
    }
    setDeleteOpen(false);
    setSelectedId(null);
    setDetail(null);
    void loadList();
  }

  function buildCompleteBody(token: string): MoneyTransferCompleteConfirmBody {
    return {
      approval_token: token,
      admin_comment: adminComment,
      start_amount: parseNum(startAmount),
      amount_ils: parseNum(amountIls),
      amount_usd: parseNum(amountUsd),
      course_exchange: parseNum(courseExchange),
    };
  }

  async function runComplete() {
    if (selectedId == null) return;
    setCompleteLoading(true);
    setActionError(null);
    const r1 = await authenticatedFetchJson<MoneyTransferApprovalResponse>(
      `/api/money-transfer/orders/${selectedId}/complete/request`,
      { method: "POST" }
    );
    if (!r1.ok) {
      setCompleteLoading(false);
      if (r1.unauthorized) router.replace("/");
      else setActionError(r1.message);
      return;
    }
    const body = buildCompleteBody(r1.data.approval_token);
    if (
      [
        body.start_amount,
        body.amount_ils,
        body.amount_usd,
        body.course_exchange,
      ].some((n) => n === undefined || Number.isNaN(n))
    ) {
      setActionError("Проверьте числовые поля перед завершением");
      setCompleteLoading(false);
      return;
    }
    const r2 = await authenticatedFetchJson<MoneyTransferOrderDetailResponse>(
      `/api/money-transfer/orders/${selectedId}/complete/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setCompleteLoading(false);
    if (!r2.ok) {
      if (r2.unauthorized) router.replace("/");
      else setActionError(r2.message);
      return;
    }
    setCompleteOpen(false);
    setSelectedId(null);
    setDetail(null);
    void loadList();
  }

  useEffect(() => {
    if (!createOpen || createStep !== "users") return;
    let cancelled = false;
    async function loadUsers() {
      setUsersLoading(true);
      const params = new URLSearchParams({ page: "1", page_size: "30" });
      if (debouncedUserSearch.trim()) params.set("search", debouncedUserSearch.trim());
      const r = await authenticatedFetchJson<MoneyTransferUsersListResponse>(
        `/api/money-transfer/users?${params}`,
        { cache: "no-store" }
      );
      if (cancelled) return;
      setUsersLoading(false);
      if (!r.ok) {
        setUsers([]);
        return;
      }
      setUsers(r.data.items ?? []);
    }
    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [createOpen, createStep, debouncedUserSearch, usersRefreshKey]);

  function resetCreateModal() {
    setCreateOpen(false);
    setCreateStep("users");
    setPickedUser(null);
    setCardUserId(null);
    setUserSearch("");
    setCAddress("");
    setCStartUsd("");
    setCIls("");
    setCUsd("");
    setCDelivery("");
    setCCommission("");
  }

  async function submitCreate() {
    if (!pickedUser) return;
    const amount_start_usd = parseNum(cStartUsd);
    const amount_ils = parseNum(cIls);
    const amount_usd = parseNum(cUsd);
    const delivery_fee_ils = parseNum(cDelivery);
    const commission_ils = parseNum(cCommission);
    if (
      !cAddress.trim() ||
      [amount_start_usd, amount_ils, amount_usd, delivery_fee_ils, commission_ils].some(
        Number.isNaN
      )
    ) {
      setActionError("Заполните адрес и суммы");
      return;
    }
    const body: MoneyTransferOrderCreateBody = {
      user_id: pickedUser.id,
      address: cAddress.trim(),
      amount_start_usd,
      amount_ils,
      amount_usd,
      delivery_fee_ils,
      commission_ils,
    };
    setCreateSubmitting(true);
    setActionError(null);
    const r = await authenticatedFetchJson<{
      item?: MoneyTransferOrderItem;
      id?: number;
    }>("/api/money-transfer/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setCreateSubmitting(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setActionError(r.message);
      return;
    }
    const newId = r.data.item?.id ?? r.data.id;
    resetCreateModal();
    await loadList();
    if (newId != null) setSelectedId(newId);
  }

  const title = variant === "current" ? "Заказы" : "История заказов";

  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#e3e3e8] px-8 pb-5 pt-8">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {variant === "current" ? (
            <button
              type="button"
              onClick={() => {
                setCreateOpen(true);
                setCreateStep("users");
                setPickedUser(null);
              }}
              className="rounded-xl bg-[#006c6b] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#005a59]"
            >
              Создать заказ
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void loadList()}
            disabled={listLoading}
            className="rounded-xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-2 text-[13px] font-medium text-[#6e6e6e] hover:bg-[#ececee] disabled:opacity-50"
          >
            Обновить
          </button>
        </div>
      </header>

      {(listError || actionError) && (
        <div className="border-b border-red-200 bg-red-50 px-8 py-3 text-[14px] text-red-800">
          {listError ? <p>{listError}</p> : null}
          {actionError ? <p className={listError ? "mt-1" : ""}>{actionError}</p> : null}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex w-full max-w-[440px] shrink-0 flex-col border-r border-[#e8e8ec] bg-[#fafafa]">
          {listLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-[14px] text-[#6e6e6e]">
              Загрузка…
            </div>
          ) : null}
          <div className="shrink-0 space-y-3 px-6 pb-3 pt-5">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск заказа"
              className="w-full rounded-2xl border-0 bg-[#e9ecef] px-4 py-3.5 text-[15px] text-[#0a0a0a] placeholder:text-[#8a8a8a] outline-none focus:bg-[#e3e7eb]"
            />
            {variant === "current" ? (
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: "all" as const, label: "Все", value: null as boolean | null },
                    { key: "yes", label: "Собранные", value: true },
                    { key: "no", label: "Не собранные", value: false },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCollected(opt.value)}
                    className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                      collected === opt.value
                        ? "border-[#006c6b] bg-[#006c6b] text-white"
                        : "border-[#e4e4e4] bg-white text-[#3a3a3a] hover:border-[#d0d0d0]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
            <div className="space-y-3">
              {listItems.map((o) => (
                <MtOrderCard
                  key={o.id}
                  order={o}
                  selected={selectedId === o.id}
                  onSelect={() => setSelectedId(o.id)}
                />
              ))}
            </div>
            {listItems.length === 0 && !listLoading ? (
              <p className="py-8 text-center text-[14px] text-[#8a8a8a]">Нет заказов</p>
            ) : null}
          </div>
          <div className="shrink-0 border-t border-[#ececee] px-6 py-4">
            <div className="flex items-center justify-between gap-2 text-[13px] text-[#6e6e6e]">
              <span>
                {total.toLocaleString("ru-RU")} · стр. {page}/{totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || listLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-[#e8e8ec] bg-white px-3 py-1.5 disabled:opacity-40"
                >
                  Назад
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || listLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[#e8e8ec] bg-white px-3 py-1.5 disabled:opacity-40"
                >
                  Вперёд
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white">
          {detailLoading ? (
            <div className="flex min-h-[320px] items-center justify-center text-[15px] text-[#8a8a8a]">
              Загрузка…
            </div>
          ) : detailError ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-8 text-center text-[15px] text-red-700">
              {detailError}
            </div>
          ) : item ? (
            <div className="flex min-h-full flex-col">
              <div className="border-b border-[#ececee] px-8 pb-6 pt-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <label className="text-[13px] font-medium text-[#8a8a8a]">
                      Оставить комментарий к заказу
                    </label>
                    <div className="mt-2 flex flex-wrap items-start gap-2">
                      <textarea
                        placeholder="Введите текст"
                        rows={3}
                        disabled={readOnly}
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        className="min-w-[200px] flex-1 resize-none rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#b0b0b0] outline-none focus:border-[#d0d0d4] disabled:opacity-60"
                      />
                      {!readOnly ? (
                        <button
                          type="button"
                          disabled={patchSaving}
                          onClick={() => void savePatch()}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006c6b] text-white hover:bg-[#005a59] disabled:opacity-50"
                          aria-label="Сохранить"
                        >
                          ✓
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="shrink-0 rounded-xl bg-[#ef4444] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#dc2626]"
                    >
                      Удалить заказ
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 px-8 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ececee] pb-5">
                  <h2 className="text-[20px] font-bold text-[#0a0a0a]">Заказ</h2>
                  <span className="text-[15px] font-medium text-[#6e6e6e]">
                    {formatMtDateTime(item.created_at)}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-[17px] font-bold text-[#0a0a0a]">№ {item.order_code}</span>
                  <button
                    type="button"
                    onClick={() => void copyText(item.order_code)}
                    className="rounded-md p-1 text-[#8a8a8a] hover:bg-black/5"
                    aria-label="Копировать номер"
                  >
                    <IconCopy className="h-4 w-4" />
                  </button>
                  <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium text-[#3a3a3a]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.is_collected ? "bg-[#22c55e]" : "bg-[#9ca3af]"
                      }`}
                    />
                    Статус заказа: {item.status_label || (item.is_collected ? "Собранный" : "Не собран")}
                  </span>
                </div>

                <div className="mt-8 grid gap-6 border-b border-[#ececee] pb-8 md:grid-cols-2">
                  <div>
                    <p className="text-[13px] font-medium text-[#8a8a8a]">Клиент</p>
                    <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">{item.client_name}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#8a8a8a]">Номер телефона</p>
                    <div className="mt-2 flex items-center gap-2">
                      <IconPhone className="text-[#8a8a8a]" />
                      <span className="text-[14px] text-[#3a3a3a]">{item.client_phone}</span>
                      <button
                        type="button"
                        onClick={() => void copyText(item.client_phone.replace(/\s/g, ""))}
                        className="rounded-md p-1 text-[#8a8a8a] hover:bg-black/5"
                        aria-label="Копировать"
                      >
                        <IconCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-b border-[#ececee] pb-8">
                  <p className="text-[13px] font-medium text-[#8a8a8a]">Адрес</p>
                  <div className="mt-2 flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-[#0a0a0a]">
                      {item.address}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyText(item.address)}
                      className="shrink-0 rounded-md p-1 text-[#8a8a8a] hover:bg-black/5"
                      aria-label="Копировать адрес"
                    >
                      <IconCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#ececee] bg-[#fafafa] p-5">
                    <h3 className="text-[15px] font-bold text-[#0a0a0a]">Сумма заказа</h3>
                    <div className="mt-4 space-y-3">
                      <Field
                        label="Общая сумма $"
                        value={startAmount}
                        onChange={setStartAmount}
                        disabled={readOnly}
                      />
                      <Field
                        label="Сумма ₪"
                        value={amountIls}
                        onChange={setAmountIls}
                        disabled={readOnly}
                      />
                      <Field
                        label="Сумма $"
                        value={amountUsd}
                        onChange={setAmountUsd}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#ececee] bg-[#fafafa] p-5">
                    <h3 className="text-[15px] font-bold text-[#0a0a0a]">Полученная сумма</h3>
                    <div className="mt-4 space-y-2 text-[14px]">
                      <p>
                        <span className="text-[#8a8a8a]">Сумма ₪ </span>
                        <span className="font-semibold">{formatMtMoney(item.paid_ils)} ₪</span>
                      </p>
                      <p>
                        <span className="text-[#8a8a8a]">Сумма $ </span>
                        <span className="font-semibold">{formatMtMoney(item.paid_usd)} $</span>
                      </p>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Курс"
                        value={courseExchange}
                        onChange={setCourseExchange}
                        disabled={readOnly}
                      />
                      <div>
                        <p className="text-[12px] font-medium text-[#8a8a8a]">Комиссия</p>
                        <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">
                          {formatMtMoney(item.commission_ils)} ₪ / {formatMtMoney(item.commission_usd)} $
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {transfers.length > 0 ? (
                  <div className="mt-10">
                    <h3 className="text-[16px] font-bold text-[#0a0a0a]">Трансферы</h3>
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#ececee]">
                      <table className="w-full min-w-[520px] text-left text-[14px]">
                        <thead className="border-b border-[#ececee] bg-[#f8f8fa] text-[12px] font-semibold uppercase text-[#8a8a8a]">
                          <tr>
                            <th className="px-4 py-3">Получатель</th>
                            <th className="px-4 py-3">Телефон</th>
                            <th className="px-4 py-3">Сумма $</th>
                            <th className="px-4 py-3">Доставка</th>
                            <th className="px-4 py-3">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transfers.map((t: MoneyTransferTransfer) => (
                            <tr key={t.id} className="border-b border-[#f0f0f2]">
                              <td className="px-4 py-3 font-medium">{t.recipient_name}</td>
                              <td className="px-4 py-3">{t.recipient_phone}</td>
                              <td className="px-4 py-3">{formatMtMoney(t.amount_usd)}</td>
                              <td className="px-4 py-3">{t.delivery ? "Да" : "Нет"}</td>
                              <td className="px-4 py-3">{t.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {canComplete ? (
                  <div className="mt-10 pb-8">
                    <button
                      type="button"
                      onClick={() => setCompleteOpen(true)}
                      className="w-full max-w-md rounded-2xl bg-[#006c6b] py-4 text-[16px] font-semibold text-white hover:bg-[#005a59]"
                    >
                      Завершен
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center px-8 text-center text-[15px] text-[#8a8a8a]">
              Выберите заказ в списке
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Внимание !"
        message="Вы действительно хотите удалить заказ?"
        confirmLabel="Удалить"
        loading={deleteLoading}
        danger
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={() => void runDelete()}
      />

      <ConfirmModal
        open={completeOpen}
        title="Завершение заказа"
        message="Подтвердите завершение заказа. Будут применены текущие суммы и комментарий."
        confirmLabel="Завершить"
        loading={completeLoading}
        onClose={() => !completeLoading && setCompleteOpen(false)}
        onConfirm={() => void runComplete()}
      />

      {createOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#ececee] px-6 py-4">
              <h2 className="text-[18px] font-bold text-[#0a0a0a]">Создание заказа</h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {createStep === "users" ? (
                  <button
                    type="button"
                    onClick={() => setAddMtUserOpen(true)}
                    className="rounded-xl bg-[#006c6b] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#005a59]"
                  >
                    Добавить пользователя
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => resetCreateModal()}
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
                  aria-label="Закрыть"
                >
                  <IconClose />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {createStep === "users" ? (
                <>
                  <input
                    type="search"
                    placeholder="Поиск пользователя"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                  />
                  {usersLoading ? (
                    <p className="mt-4 text-[14px] text-[#8a8a8a]">Загрузка…</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececee]">
                      <table className="w-full min-w-[560px] text-left text-[13px]">
                        <thead className="border-b bg-[#fafafa] text-[11px] font-semibold uppercase text-[#8a8a8a]">
                          <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Клиент</th>
                            <th className="px-3 py-2">Телефон</th>
                            <th className="px-3 py-2">Telegram</th>
                            <th className="px-3 py-2">Регистрация</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id} className="border-b border-[#f0f0f2]">
                              <td className="px-3 py-2">{u.id}</td>
                              <td className="px-3 py-2 font-medium">{u.full_name}</td>
                              <td className="px-3 py-2">{u.phone_number}</td>
                              <td className="px-3 py-2">{formatTelegramDisplay(u.username ?? "")}</td>
                              <td className="px-3 py-2">{formatUserDate(u.registered_at)}</td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => setCardUserId(u.id)}
                                  className="rounded-lg bg-[#006c6b] px-3 py-1.5 text-[12px] font-semibold text-white"
                                >
                                  Создать заказ
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : pickedUser ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[#ececee] bg-[#f8f8fa] p-4 text-[14px]">
                    <p className="text-[12px] text-[#8a8a8a]">ID</p>
                    <p className="font-semibold">{pickedUser.id}</p>
                    <p className="mt-2 text-[12px] text-[#8a8a8a]">Пользователь</p>
                    <p className="font-semibold">{pickedUser.full_name}</p>
                    <p className="mt-2 text-[12px] text-[#8a8a8a]">Телефон</p>
                    <p>{pickedUser.phone_number}</p>
                  </div>
                  <label className="block">
                    <span className="text-[13px] font-medium text-[#8a8a8a]">
                      Адрес забора денег
                    </span>
                    <textarea
                      rows={4}
                      value={cAddress}
                      onChange={(e) => setCAddress(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#e8e8ec] px-4 py-3 text-[14px]"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-[12px] text-[#8a8a8a]">Общая сумма $</span>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={cStartUsd}
                        onChange={(e) => setCStartUsd(e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[12px] text-[#8a8a8a]">Сумма ₪</span>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={cIls}
                        onChange={(e) => setCIls(e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[12px] text-[#8a8a8a]">Сумма $</span>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={cUsd}
                        onChange={(e) => setCUsd(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[12px] text-[#8a8a8a]">Доставка (₪)</span>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={cDelivery}
                        onChange={(e) => setCDelivery(e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[12px] text-[#8a8a8a]">Комиссия (₪)</span>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={cCommission}
                        onChange={(e) => setCCommission(e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    disabled={createSubmitting}
                    onClick={() => void submitCreate()}
                    className="w-full rounded-2xl bg-[#006c6b] py-4 text-[15px] font-semibold text-white disabled:opacity-50"
                  >
                    {createSubmitting ? "Создание…" : "Создать заказ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateStep("users")}
                    className="w-full text-[14px] text-[#006c6b] underline"
                  >
                    Назад к списку
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <MtUserDetailModal
        userId={cardUserId}
        open={cardUserId != null}
        onClose={() => setCardUserId(null)}
        showCreateOrderActions
        onProceedCreateOrder={(u) => {
          setPickedUser(u);
          setCAddress(u.address?.trim() ? u.address : "");
          setCreateStep("form");
          setCardUserId(null);
        }}
        onUserUpdated={() => setUsersRefreshKey((k) => k + 1)}
      />

      <MtAddUserModal
        open={addMtUserOpen}
        onClose={() => setAddMtUserOpen(false)}
        onSuccess={() => setUsersRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[#8a8a8a]">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-[#e4e4e4] bg-white px-3 py-2 text-[14px] disabled:bg-[#f0f0f0]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </label>
  );
}
