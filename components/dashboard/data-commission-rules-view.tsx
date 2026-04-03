"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { parseDataDecimal } from "@/lib/data-admin-format";
import type {
  CommissionRuleItem,
  CommissionRulePatchBody,
  CommissionRulePatchResponse,
  CommissionRulesListResponse,
} from "@/types/data-admin-api";

function IconCheck() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RowState = {
  valueStr: string;
  valueType: "fixed" | "percent";
};

export function DataCommissionRulesView() {
  const router = useRouter();
  const [items, setItems] = useState<CommissionRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowState, setRowState] = useState<Record<number, RowState>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    const r = await authenticatedFetchJson<CommissionRulesListResponse>(
      `/api/data/commission-rules?${params}`,
      { cache: "no-store" }
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      setItems([]);
      return;
    }
    const list = Array.isArray(r.data.items) ? r.data.items : [];
    setItems(list);
    setTotal(r.data.total ?? list.length);
    const nextRows: Record<number, RowState> = {};
    for (const it of list) {
      const n = parseDataDecimal(it.value);
      nextRows[it.id] = {
        valueStr: Number.isFinite(n)
          ? n.toLocaleString("ru-RU", { maximumFractionDigits: 4 })
          : String(it.value),
        valueType: it.value_type === "percent" ? "percent" : "fixed",
      };
    }
    setRowState(nextRows);
  }, [page, router]);

  useEffect(() => {
    void load();
  }, [load]);

  function syncRowFromServer(it: CommissionRuleItem) {
    const n = parseDataDecimal(it.value);
    setRowState((prev) => ({
      ...prev,
      [it.id]: {
        valueStr: Number.isFinite(n)
          ? n.toLocaleString("ru-RU", { maximumFractionDigits: 4 })
          : String(it.value),
        valueType: it.value_type === "percent" ? "percent" : "fixed",
      },
    }));
  }

  async function saveRule(it: CommissionRuleItem) {
    const st = rowState[it.id];
    if (!st) return;
    const raw = String(st.valueStr).replace(/\s/g, "").replace(",", ".");
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      setError("Некорректное значение комиссии");
      return;
    }
    setError(null);
    setSavingId(it.id);
    const body: CommissionRulePatchBody = {
      value,
      value_type: st.valueType,
    };
    const r = await authenticatedFetchJson<CommissionRulePatchResponse>(
      `/api/data/commission-rules/${it.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSavingId(null);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    if (r.data.item) {
      setItems((list) => list.map((x) => (x.id === it.id ? r.data.item : x)));
      syncRowFromServer(r.data.item);
    } else {
      void load();
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  return (
    <div className="min-h-full bg-[#f5f5f7] px-4 py-8 md:px-8">
      <header className="mb-8 border-b border-[#e3e3e8] pb-6">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
          Изменить комиссию
        </h1>
      </header>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#e8e8ec] bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-[#6e6e6e]">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-[#8a8a8a]">Нет правил</div>
        ) : (
          <ul className="divide-y divide-[#ececee]">
            {items.map((it) => {
              const st = rowState[it.id] ?? {
                valueStr: "",
                valueType: it.value_type,
              };
              return (
                <li
                  key={it.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="min-w-0 flex-[1.2] sm:flex-[1.4]">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">
                      Диапазон
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-[#0a0a0a]">
                      {it.range_label?.trim() ||
                        `${formatRangeUsd(it.min_usd)} — ${formatRangeUsd(it.max_usd)} $`}
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-[1] items-end gap-3 sm:items-center">
                    <label className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">
                        Комиссия
                      </span>
                      <div className="mt-1 rounded-xl border border-[#e8e8ec] bg-[#fafafa] px-3 py-2">
                        <input
                          className="w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-[#0a0a0a] outline-none"
                          value={st.valueStr}
                          onChange={(e) =>
                            setRowState((prev) => ({
                              ...prev,
                              [it.id]: { ...st, valueStr: e.target.value },
                            }))
                          }
                          inputMode="decimal"
                        />
                      </div>
                    </label>
                    <div className="flex shrink-0 gap-2 pb-0.5 sm:pb-0">
                      <button
                        type="button"
                        onClick={() =>
                          setRowState((prev) => ({
                            ...prev,
                            [it.id]: { ...st, valueType: "fixed" },
                          }))
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-[16px] font-bold transition ${
                          st.valueType === "fixed"
                            ? "border-[#006c6b] bg-[#006c6b] text-white"
                            : "border-[#e0e0e4] bg-white text-[#6e6e6e] hover:border-[#d0d0d4]"
                        }`}
                        title="Фикс ₪"
                        aria-label="Фиксированная сумма в шекелях"
                      >
                        ₪
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRowState((prev) => ({
                            ...prev,
                            [it.id]: { ...st, valueType: "percent" },
                          }))
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-[16px] font-bold transition ${
                          st.valueType === "percent"
                            ? "border-[#006c6b] bg-[#006c6b] text-white"
                            : "border-[#e0e0e4] bg-white text-[#6e6e6e] hover:border-[#d0d0d4]"
                        }`}
                        title="Процент"
                        aria-label="Процент от суммы"
                      >
                        %
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={savingId === it.id}
                      onClick={() => void saveRule(it)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#006c6b] text-white hover:bg-[#005a59] disabled:opacity-50"
                      aria-label="Сохранить"
                    >
                      <IconCheck />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[14px] text-[#6e6e6e]">
          <span>
            Стр. {page} из {totalPages} · Всего {total.toLocaleString("ru-RU")}
          </span>
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
      ) : null}
    </div>
  );
}

function formatRangeUsd(s: string): string {
  const n = parseDataDecimal(s);
  if (!Number.isFinite(n)) return s;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}
