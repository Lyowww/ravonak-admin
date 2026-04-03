"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import {
  formatDataUsd,
  formatEntryDateRu,
  formatDataRate,
  normalizeDebitCategories,
  parseDateToApi,
  todayRuDate,
} from "@/lib/data-admin-format";
import type {
  DebitCreditCategoriesResponse,
  DebitCreditCategoryItem,
  DebitCreditHistoryResponse,
  DebitCreditPostPurchaseRateBody,
  DebitCreditPostResponse,
  DebitCreditPostTransactionBody,
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

function InnerInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <div className="rounded-xl border border-[#e8e8ec] bg-white px-3 py-2 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">
          {label}
        </p>
        <input
          className="mt-0.5 w-full border-0 bg-transparent p-0 text-[14px] font-medium text-[#0a0a0a] outline-none placeholder:text-[#c4c4cc]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
        />
      </div>
    </label>
  );
}

export function DataDebitCreditView() {
  const router = useRouter();
  const [categories, setCategories] = useState<DebitCreditCategoryItem[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [history, setHistory] = useState<DebitCreditHistoryResponse | null>(null);
  const [histLoading, setHistLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<
    Record<string, { dateRu: string; amount: string }>
  >({});
  const [rateRow, setRateRow] = useState({ dateRu: todayRuDate(), rate: "" });
  const [rowSaving, setRowSaving] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    const r = await authenticatedFetchJson<DebitCreditCategoriesResponse>(
      "/api/data/debit-credit/categories",
      { cache: "no-store" }
    );
    setCatLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    const list = normalizeDebitCategories(r.data);
    setCategories(list);
    const init: Record<string, { dateRu: string; amount: string }> = {};
    const t = todayRuDate();
    for (const c of list) {
      init[c.category] = { dateRu: t, amount: "" };
    }
    setRows((prev) => {
      const next = { ...init };
      for (const k of Object.keys(next)) {
        if (prev[k]) next[k] = { ...next[k], ...prev[k], dateRu: prev[k].dateRu || next[k].dateRu };
      }
      return next;
    });
  }, [router]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    const params = new URLSearchParams({
      kind: "all",
      limit_transactions: "80",
      limit_rates: "40",
    });
    const r = await authenticatedFetchJson<DebitCreditHistoryResponse>(
      `/api/data/debit-credit/history?${params}`,
      { cache: "no-store" }
    );
    setHistLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      return;
    }
    setHistory({
      transactions: Array.isArray(r.data.transactions) ? r.data.transactions : [],
      purchase_rates: Array.isArray(r.data.purchase_rates) ? r.data.purchase_rates : [],
    });
  }, [router]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function submitTransaction(category: string) {
    const row = rows[category];
    if (!row) return;
    const apiDate = parseDateToApi(row.dateRu);
    if (!apiDate) {
      setError("Некорректная дата");
      return;
    }
    const amt = String(row.amount).replace(/\s/g, "").replace(",", ".");
    const n = Number(amt);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Введите положительную сумму");
      return;
    }
    setError(null);
    setRowSaving(category);
    const body: DebitCreditPostTransactionBody = {
      entry_kind: "transaction",
      summary: "Операция (дата + сумма)",
      value: {
        category,
        amount: amt,
        date: apiDate,
      },
    };
    const r = await authenticatedFetchJson<DebitCreditPostResponse>(
      "/api/data/debit-credit/entries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setRowSaving(null);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    setRows((prev) => ({
      ...prev,
      [category]: { ...prev[category], amount: "" },
    }));
    void loadHistory();
  }

  async function submitRate() {
    const apiDate = parseDateToApi(rateRow.dateRu);
    if (!apiDate) {
      setError("Некорректная дата");
      return;
    }
    const rt = String(rateRow.rate).replace(/\s/g, "").replace(",", ".");
    const n = Number(rt);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Введите положительный курс");
      return;
    }
    setError(null);
    setRowSaving("rate");
    const body: DebitCreditPostPurchaseRateBody = {
      entry_kind: "purchase_rate",
      summary: "Курс покупки",
      value: {
        rate: rt,
        date: apiDate,
      },
    };
    const r = await authenticatedFetchJson<DebitCreditPostResponse>(
      "/api/data/debit-credit/entries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setRowSaving(null);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    setRateRow((row) => ({ ...row, rate: "" }));
    void loadHistory();
  }

  const txns = history?.transactions ?? [];
  const rates = history?.purchase_rates ?? [];

  return (
    <div className="min-h-full bg-[#f0f0f2] px-4 py-8 md:px-8">
      <header className="mb-8 border-b border-[#e3e3e8] pb-6">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
          Дебит-Кредит
        </h1>
      </header>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4 xl:max-w-[640px]">
          {catLoading ? (
            <p className="text-[14px] text-[#6e6e6e]">Загрузка категорий…</p>
          ) : categories.length === 0 ? (
            <p className="text-[14px] text-[#6e6e6e]">Категории не найдены</p>
          ) : (
            categories.map((cat) => {
              const row = rows[cat.category] ?? {
                dateRu: todayRuDate(),
                amount: "",
              };
              return (
                <div
                  key={cat.category}
                  className="flex flex-wrap items-stretch gap-3 md:flex-nowrap"
                >
                  <div className="flex min-w-[160px] max-w-[220px] flex-[1.1] items-center text-[13px] font-medium leading-snug text-[#3a3a3e] md:flex-[1.2]">
                    {cat.label}
                  </div>
                  <div className="flex min-w-0 flex-[2] gap-2">
                    <InnerInput
                      label="Дата"
                      value={row.dateRu}
                      onChange={(v) =>
                        setRows((prev) => ({
                          ...prev,
                          [cat.category]: { ...row, dateRu: v },
                        }))
                      }
                      placeholder="01.01.2026"
                    />
                    <InnerInput
                      label="Сумма"
                      value={row.amount}
                      onChange={(v) =>
                        setRows((prev) => ({
                          ...prev,
                          [cat.category]: { ...row, amount: v },
                        }))
                      }
                      placeholder="10 000"
                      inputMode="decimal"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={rowSaving === cat.category}
                    onClick={() => void submitTransaction(cat.category)}
                    className="flex h-[52px] w-[52px] shrink-0 items-center justify-center self-end rounded-xl bg-[#006c6b] text-white shadow-sm transition hover:bg-[#005a59] disabled:opacity-50 md:self-auto"
                    aria-label="Сохранить"
                  >
                    <IconCheck />
                  </button>
                </div>
              );
            })
          )}

          <div className="flex flex-wrap items-stretch gap-3 border-t border-[#e3e3e8] pt-6 md:flex-nowrap">
            <div className="flex min-w-[160px] max-w-[220px] flex-[1.1] items-center text-[13px] font-medium text-[#3a3a3e] md:flex-[1.2]">
              Курс покупки
            </div>
            <div className="flex min-w-0 flex-[2] gap-2">
              <InnerInput
                label="Дата"
                value={rateRow.dateRu}
                onChange={(v) => setRateRow((r) => ({ ...r, dateRu: v }))}
                placeholder="01.01.2026"
              />
              <InnerInput
                label="Курс"
                value={rateRow.rate}
                onChange={(v) => setRateRow((r) => ({ ...r, rate: v }))}
                placeholder="1,5"
                inputMode="decimal"
              />
            </div>
            <button
              type="button"
              disabled={rowSaving === "rate"}
              onClick={() => void submitRate()}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center self-end rounded-xl border border-[#e0e0e4] bg-[#ececee] text-[#5a5a5e] transition hover:bg-[#e2e2e6] disabled:opacity-50 md:self-auto"
              aria-label="Сохранить курс"
            >
              <IconCheck />
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-8 xl:sticky xl:top-6 xl:max-w-[520px]">
          <section className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">Дебит-кредит:</h2>
            {histLoading ? (
              <p className="mt-4 text-[14px] text-[#8a8a8a]">Загрузка…</p>
            ) : txns.length === 0 ? (
              <p className="mt-4 text-[14px] text-[#8a8a8a]">Нет записей</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {txns.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start justify-between gap-4 border-b border-[#f0f0f2] pb-3 last:border-0 last:pb-0"
                  >
                    <span className="min-w-0 flex-1 text-[14px] leading-snug text-[#3a3a3e]">
                      {t.label_ru || t.category}:
                    </span>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold text-[#0a0a0a]">
                        {formatDataUsd(t.amount_usd)}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#8a8a8a]">
                        {formatEntryDateRu(t.entry_date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">Курсы:</h2>
            {histLoading ? (
              <p className="mt-4 text-[14px] text-[#8a8a8a]">Загрузка…</p>
            ) : rates.length === 0 ? (
              <p className="mt-4 text-[14px] text-[#8a8a8a]">Нет записей</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {rates.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 border-b border-[#f0f0f2] pb-3 text-[14px] last:border-0 last:pb-0"
                  >
                    <span className="text-[#6e6e6e]">{formatEntryDateRu(r.entry_date)}</span>
                    <span className="font-semibold tabular-nums text-[#0a0a0a]">
                      {formatDataRate(r.rate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
