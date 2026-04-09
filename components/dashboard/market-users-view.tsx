"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import {
  formatBalanceUsd,
  formatTelegramDisplay,
  formatUserDate,
  formatUserDateTime,
  isWithdrawOperation,
  operationTitleRu,
} from "@/lib/market-users-format";
import type {
  BalanceHistoryItem,
  BalanceHistoryResponse,
  BalanceMutationBody,
  BalanceMutationResponse,
  MarketUserDetailResponse,
  MarketUserItem,
  MarketUsersListResponse,
} from "@/types/market-users-api";

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

function UserDetailModal({
  userId,
  open,
  onClose,
  onListRefresh,
}: {
  userId: number | null;
  open: boolean;
  onClose: () => void;
  onListRefresh: () => void;
}) {
  const router = useRouter();
  const [item, setItem] = useState<MarketUserItem | null>(null);
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [amountStr, setAmountStr] = useState("");
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState<"topup" | "withdraw" | null>(null);

  const loadDetail = useCallback(async () => {
    if (userId == null) return;
    setLoading(true);
    setErr(null);
    const r = await authenticatedFetchJson<MarketUserDetailResponse>(
      `/api/market/users/${userId}`
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      setItem(null);
      return;
    }
    setItem(r.data.item);
  }, [userId, router]);

  const loadHistory = useCallback(async () => {
    if (userId == null) return;
    setHistLoading(true);
    const r = await authenticatedFetchJson<BalanceHistoryResponse>(
      `/api/market/users/${userId}/balance/history?limit=50`
    );
    setHistLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      setHistory([]);
      return;
    }
    setHistory(Array.isArray(r.data.items) ? r.data.items : []);
  }, [userId, router]);

  useEffect(() => {
    if (!open || userId == null) {
      setItem(null);
      setHistory([]);
      setAmountStr("");
      setComment("");
      setErr(null);
      return;
    }
    void loadDetail();
    void loadHistory();
  }, [open, userId, loadDetail, loadHistory]);

  async function runBalance(kind: "topup" | "withdraw") {
    if (userId == null || !item) return;
    const raw = String(amountStr).replace(/\s/g, "").replace(",", ".");
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErr("Введите сумму больше 0");
      return;
    }
    setErr(null);
    setActionLoading(kind);
    const body: BalanceMutationBody = {
      amount_usd: amount,
      comment: comment.trim(),
    };
    const path =
      kind === "topup"
        ? `/api/market/users/${userId}/balance/topup`
        : `/api/market/users/${userId}/balance/withdraw`;
    const r = await authenticatedFetchJson<BalanceMutationResponse>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setActionLoading(null);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      return;
    }
    setItem((prev) =>
      prev ? { ...prev, balance_usd: r.data.new_balance_usd } : prev
    );
    if (r.data.history_item) {
      setHistory((h) => [r.data.history_item, ...h]);
    } else {
      void loadHistory();
    }
    setAmountStr("");
    setComment("");
    onListRefresh();
  }

  if (!open || userId == null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#0a0a0a]">Пользователь</h2>
          <button
            type="button"
            onClick={onClose}
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
        ) : err && !item ? (
          <div className="px-6 py-8 text-center text-red-600">{err}</div>
        ) : item ? (
          <div className="overflow-y-auto px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox label="Пользователь" value={item.full_name || "—"} />
              <InfoBox label="Дата регистрации" value={formatUserDate(item.registered_at)} />
              <InfoBox label="ID" value={String(item.id)} />
              <InfoBox label="Telegram ID" value={String(item.tg_id)} />
              <InfoBox label="Номер телефона" value={item.phone_number || "—"} />
              <InfoBox label="Telegram" value={formatTelegramDisplay(item.telegram_username)} />
            </div>

            {err ? (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-[13px] text-red-700">
                {err}
              </p>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-[15px] font-bold text-[#0a0a0a]">Баланс</h3>
                <div className="mt-3 rounded-2xl border border-[#e8e8ec] bg-[#f8f8fa] px-4 py-3">
                  <p className="text-[12px] font-medium text-[#8a8a8a]">Активный баланс</p>
                  <p className="mt-1 text-[22px] font-semibold text-[#0a0a0a]">
                    {formatBalanceUsd(item.balance_usd)}
                  </p>
                </div>
                <label className="mt-4 block">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Сумма (USD)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    placeholder="Введите сумму изменения баланса"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                  />
                </label>
                {/* <label className="mt-3 block">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Комментарий</span>
                  <input
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    placeholder="Необязательно"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </label> */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionLoading != null}
                    onClick={() => void runBalance("topup")}
                    className="flex-1 rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50 min-w-[140px]"
                  >
                    {actionLoading === "topup" ? "…" : "Пополнить"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading != null}
                    onClick={() => void runBalance("withdraw")}
                    className="flex-1 rounded-2xl bg-[#e53935] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#c62828] disabled:opacity-50 min-w-[140px]"
                  >
                    {actionLoading === "withdraw" ? "…" : "Списать"}
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                <h3 className="text-[15px] font-bold text-[#0a0a0a]">Последние изменения</h3>
                <div className="mt-3 max-h-[320px] flex-1 space-y-2 overflow-y-auto rounded-2xl border border-[#e8e8ec] bg-[#fafafa] p-3">
                  {histLoading ? (
                    <p className="text-[13px] text-[#8a8a8a]">Загрузка…</p>
                  ) : history.length === 0 ? (
                    <p className="text-[13px] text-[#8a8a8a]">Нет операций</p>
                  ) : (
                    history.map((h) => {
                      const neg = isWithdrawOperation(h.operation) || h.amount_usd < 0;
                      const amt = Math.abs(h.amount_usd);
                      return (
                        <div
                          key={h.id}
                          className="flex gap-3 rounded-xl border border-[#ececee] bg-white px-3 py-2.5"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                              neg
                                ? "bg-[#ffebee] text-[#c62828]"
                                : "bg-[#e8f5e9] text-[#2e7d32]"
                            }`}
                          >
                            {neg ? "−" : "+"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#0a0a0a]">
                              {h.title || operationTitleRu(h.operation)}
                            </p>
                            <p className="text-[11px] text-[#8a8a8a]">
                              {formatUserDateTime(h.created_at)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 text-[13px] font-semibold ${
                              neg ? "text-[#c62828]" : "text-[#2e7d32]"
                            }`}
                          >
                            {neg ? "−" : "+"}
                            {amt.toLocaleString("ru-RU", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 3,
                            })}{" "}
                            $
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e8ec] bg-[#f8f8fa] px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-medium text-[#0a0a0a]">{value}</p>
    </div>
  );
}

export function MarketUsersView() {
  const router = useRouter();
  const [items, setItems] = useState<MarketUserItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const searchDebounceReady = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      if (searchDebounceReady.current) setPage(1);
      searchDebounceReady.current = true;
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    const r = await authenticatedFetchJson<MarketUsersListResponse>(
      `/api/market/users?${params.toString()}`
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      setItems([]);
      setTotal(0);
      return;
    }
    setItems(Array.isArray(r.data.items) ? r.data.items : []);
    setTotal(r.data.total ?? 0);
  }, [page, pageSize, debouncedSearch, router]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize) || 1),
    [total, pageSize]
  );

  function openUser(id: number) {
    setSelectedId(id);
    setModalOpen(true);
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f5f5f7]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#e3e3e8] bg-white px-8 pb-5 pt-8">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
          Пользователи
        </h1>
        <button
          type="button"
          onClick={() => void loadList()}
          disabled={loading}
          className="rounded-xl border border-[#e8e8ec] bg-white px-4 py-2 text-[13px] font-medium text-[#6e6e6e] hover:bg-[#f0f0f0] disabled:opacity-50"
        >
          Обновить
        </button>
      </header>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-8 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex-1 px-4 py-6 md:px-8">
        <input
          type="search"
          className="w-full max-w-xl rounded-2xl border border-[#e8e8ec] bg-[#e9ecef] px-4 py-3.5 text-[15px] text-[#0a0a0a] placeholder:text-[#8a8a8a] outline-none focus:bg-[#e3e7eb]"
          placeholder="Поиск пользователя"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#e8e8ec] bg-white shadow-sm">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-[14px] text-[#6e6e6e]">
              Загрузка…
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#ececee] bg-[#fafafa] text-[12px] font-semibold uppercase tracking-wide text-[#8a8a8a]">
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Клиент</th>
                  <th className="px-4 py-3.5">Номер телефона</th>
                  <th className="px-4 py-3.5">Telegram ID</th>
                  <th className="px-4 py-3.5">Дата регистрации</th>
                  <th className="px-4 py-3.5">Общий баланс</th>
                  <th className="px-4 py-3.5 w-[140px]" />
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#f0f0f2] transition hover:bg-[#f8f8fa]"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => openUser(u.id)}
                        className="font-medium text-[#006c6b] hover:underline"
                      >
                        {u.id}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#0a0a0a]">
                      <button
                        type="button"
                        onClick={() => openUser(u.id)}
                        className="text-left hover:underline"
                      >
                        {u.full_name || "—"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-[#3a3a3e]">{u.phone_number || "—"}</td>
                    <td className="px-4 py-3.5 text-[#3a3a3e]">
                      {formatTelegramDisplay(u.telegram_username)}
                    </td>
                    <td className="px-4 py-3.5 text-[#5a5a5e]">
                      {formatUserDate(u.registered_at)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#0a0a0a]">
                      {formatBalanceUsd(u.balance_usd)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => openUser(u.id)}
                        className="rounded-xl bg-[#006c6b] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#005a59]"
                      >
                        Пополнить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && !loading ? (
            <p className="px-4 py-10 text-center text-[14px] text-[#8a8a8a]">
              Пользователи не найдены
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#6e6e6e]">
          <p>
            Всего: {total.toLocaleString("ru-RU")} · Страница {page} из {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-[#e8e8ec] bg-white px-4 py-2 font-medium hover:bg-[#f5f5f7] disabled:opacity-40"
            >
              Назад
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-[#e8e8ec] bg-white px-4 py-2 font-medium hover:bg-[#f5f5f7] disabled:opacity-40"
            >
              Вперёд
            </button>
          </div>
        </div>
      </div>

      <UserDetailModal
        userId={selectedId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedId(null);
        }}
        onListRefresh={() => void loadList()}
      />
    </div>
  );
}
