"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatTelegramDisplay, formatUserDate } from "@/lib/market-users-format";
import { formatSimIls } from "@/lib/sim-bot-format";
import { SimBotAddUserModal, SimBotUserDetailModal } from "@/components/dashboard/sim-bot-user-modals";
import type { SimBotUserListItem, SimBotUsersListResponse } from "@/types/sim-bot-api";

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

export function SimBotUsersView() {
  const router = useRouter();
  const [items, setItems] = useState<SimBotUserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
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
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    const r = await authenticatedFetchJson<SimBotUsersListResponse>(
      `/api/sim-bot/users?${params.toString()}`,
      { cache: "no-store" }
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
    setDetailOpen(true);
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f5f5f7]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#e3e3e8] bg-white px-8 pb-5 pt-8">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">Пользователи</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-xl bg-[#006c6b] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#005a59]"
        >
          Добавить пользователя
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
            <table className="w-full min-w-[1100px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#ececee] bg-[#fafafa] text-[12px] font-semibold uppercase tracking-wide text-[#8a8a8a]">
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Клиент</th>
                  <th className="px-4 py-3.5">Номер телефона</th>
                  <th className="px-4 py-3.5">Telegram</th>
                  <th className="px-4 py-3.5">Тариф</th>
                  <th className="px-4 py-3.5">Баланс</th>
                  <th className="px-4 py-3.5">Статус</th>
                  <th className="px-4 py-3.5">Дата регистрации</th>
                  <th className="px-4 py-3.5 w-[72px]" aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#f0f0f2] transition hover:bg-[#f8f8fa]"
                  >
                    <td className="px-4 py-3.5 font-medium text-[#0a0a0a]">{u.id}</td>
                    <td className="px-4 py-3.5 font-medium text-[#0a0a0a]">
                      {u.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[#3a3a3e]">{u.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-[#3a3a3e]">
                      {formatTelegramDisplay(u.username ?? "")}
                    </td>
                    <td className="px-4 py-3.5 text-[#3a3a3e]">{u.tariff_name || "—"}</td>
                    <td className="px-4 py-3.5 font-medium tabular-nums text-[#0a0a0a]">
                      {formatSimIls(u.balance_amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                          u.number_active
                            ? "bg-[#e8f5e9] text-[#2e7d32]"
                            : "bg-[#ffebee] text-[#c62828]"
                        }`}
                      >
                        {u.number_active ? "Активен" : "Заморозка"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#5a5a5e]">
                      {formatUserDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openUser(u.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2e] text-white transition hover:bg-[#1a1a1e]"
                        aria-label="Открыть карточку"
                      >
                        <IconChevron />
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

      <SimBotUserDetailModal
        userId={selectedId}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedId(null);
        }}
        onUserUpdated={() => void loadList()}
      />

      <SimBotAddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => void loadList()}
      />
    </div>
  );
}
