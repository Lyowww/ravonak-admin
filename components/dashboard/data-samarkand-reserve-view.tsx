"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatDataUsd } from "@/lib/data-admin-format";
import { formatMtDateTime } from "@/lib/mt-orders-format";
import type {
  SamarkandReserveCurrentResponse,
  SamarkandReserveHistoryItem,
  SamarkandReserveHistoryResponse,
  SamarkandReservePostBody,
  SamarkandReservePostResponse,
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

export function DataSamarkandReserveView() {
  const router = useRouter();
  const [current, setCurrent] = useState<SamarkandReserveCurrentResponse | null>(null);
  const [items, setItems] = useState<SamarkandReserveHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCurrent = useCallback(async () => {
    setLoading(true);
    const r = await authenticatedFetchJson<SamarkandReserveCurrentResponse>(
      "/api/data/samarkand-reserve/current",
      { cache: "no-store" }
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      setCurrent(null);
      return;
    }
    setCurrent(r.data);
  }, [router]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    const r = await authenticatedFetchJson<SamarkandReserveHistoryResponse>(
      "/api/data/samarkand-reserve/history?limit=80",
      { cache: "no-store" }
    );
    setHistLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      return;
    }
    setItems(Array.isArray(r.data.items) ? r.data.items : []);
  }, [router]);

  useEffect(() => {
    void loadCurrent();
    void loadHistory();
  }, [loadCurrent, loadHistory]);

  async function submit() {
    const n = Number(String(amountStr).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(n)) {
      setError("Введите сумму");
      return;
    }
    setError(null);
    setSubmitting(true);
    const body: SamarkandReservePostBody = { amount_usd: n };
    const r = await authenticatedFetchJson<SamarkandReservePostResponse>(
      "/api/data/samarkand-reserve",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSubmitting(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      return;
    }
    setAmountStr("");
    void loadCurrent();
    void loadHistory();
  }

  return (
    <div className="min-h-full bg-[#f0f0f2] px-4 py-8 md:px-8">
      <header className="mb-8 border-b border-[#e3e3e8] pb-6">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
          Резерв Самарканда
        </h1>
      </header>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-6 xl:max-w-[560px]">
          <div className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#9ca3af]">
              Текущий резерв
            </p>
            {loading ? (
              <p className="mt-2 text-[15px] text-[#8a8a8a]">Загрузка…</p>
            ) : (
              <>
                <p className="mt-2 text-[32px] font-bold tabular-nums tracking-tight text-[#0a0a0a]">
                  {current != null ? formatDataUsd(current.amount_usd) : "—"}
                </p>
                {current?.updated_at ? (
                  <p className="mt-2 text-[12px] text-[#8a8a8a]">
                    Обновлено: {formatMtDateTime(current.updated_at)}
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-stretch gap-3">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Сумма USD</span>
              <div className="rounded-xl border border-[#e8e8ec] bg-white px-3 py-2 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">
                  Сумма ($)
                </p>
                <input
                  className="mt-0.5 w-full border-0 bg-transparent p-0 text-[14px] font-medium text-[#0a0a0a] outline-none placeholder:text-[#c4c4cc]"
                  placeholder="Новое значение резерва"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  inputMode="decimal"
                />
              </div>
            </label>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#006c6b] text-white shadow-sm hover:bg-[#005a59] disabled:opacity-50"
              aria-label="Записать"
            >
              <IconCheck />
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1 xl:sticky xl:top-6 xl:max-w-[480px]">
          <section className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">История</h2>
            {histLoading ? (
              <p className="mt-4 text-[14px] text-[#8a8a8a]">Загрузка…</p>
            ) : items.length === 0 ? (
              <p className="mt-4 text-[14px] text-[#8a8a8a]">Нет записей</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {items.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 border-b border-[#f0f0f2] pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-[14px] font-bold text-[#0a0a0a]">
                      {formatDataUsd(row.amount_usd)}
                    </span>
                    <span className="text-[12px] text-[#8a8a8a]">
                      {formatMtDateTime(row.created_at)}
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
