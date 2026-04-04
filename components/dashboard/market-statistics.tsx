"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStoredToken, getStoredToken } from "@/lib/auth-storage";
import { previousPeriodRange } from "@/lib/comparison-period";
import type { MarketPeriod, MarketStatisticsResponse } from "@/types/market";
import { StatCard } from "./stat-card";

const PERIOD_LABELS: Record<MarketPeriod, string> = {
  day: "За день",
  week: "За неделю",
  month: "За месяц",
  custom: "Выбрать период",
};

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultCustomDates(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

function dateStartIso(s: string): string {
  return new Date(`${s}T00:00:00`).toISOString();
}

function dateEndIso(s: string): string {
  return new Date(`${s}T23:59:59.999`).toISOString();
}

async function fetchStats(
  params: URLSearchParams,
  token: string
): Promise<MarketStatisticsResponse> {
  const res = await fetch(`/api/market/statistics?${params.toString()}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) {
    clearStoredToken();
    throw new Error("unauthorized");
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    let detail = `Ошибка ${res.status}`;
    if (typeof data === "object" && data !== null && "detail" in data) {
      const d = (data as { detail: unknown }).detail;
      if (typeof d === "string") detail = d;
      else if (Array.isArray(d) && d[0] && typeof d[0] === "object" && d[0] !== null && "msg" in d[0]) {
        detail = String((d[0] as { msg: unknown }).msg);
      }
    }
    throw new Error(detail);
  }
  return data as MarketStatisticsResponse;
}

export function MarketStatistics() {
  const router = useRouter();
  const [period, setPeriod] = useState<MarketPeriod>("week");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cur, setCur] = useState<MarketStatisticsResponse | null>(null);
  const [prev, setPrev] = useState<MarketStatisticsResponse | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc() {
      setDropdownOpen(false);
    }
    if (!dropdownOpen) return;
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropdownOpen]);

  useEffect(() => {
    if (period !== "custom") return;
    if (!customFrom || !customTo) {
      const d = defaultCustomDates();
      setCustomFrom(d.from);
      setCustomTo(d.to);
    }
  }, [period, customFrom, customTo]);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/");
      return;
    }

    if (period === "custom" && (!customFrom || !customTo)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (period === "custom") {
        params.set("period", "custom");
        params.set("date_from", dateStartIso(customFrom));
        params.set("date_to", dateEndIso(customTo));
      } else {
        params.set("period", period);
      }

      const current = await fetchStats(params, token);
      const pr = previousPeriodRange(current.date_from, current.date_to);
      const prevParams = new URLSearchParams();
      prevParams.set("period", "custom");
      prevParams.set("date_from", pr.from);
      prevParams.set("date_to", pr.to);
      const previous = await fetchStats(prevParams, token);
      setCur(current);
      setPrev(previous);
    } catch (e) {
      if (e instanceof Error && e.message === "unauthorized") {
        router.replace("/");
        return;
      }
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setCur(null);
      setPrev(null);
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const du =
    cur && prev ? cur.total_users - prev.total_users : 0;
  const da =
    cur && prev ? cur.active_users - prev.active_users : 0;
  const dAmt =
    cur && prev ? cur.total_amount_usd - prev.total_amount_usd : 0;
  const dAvg =
    cur && prev ? cur.avg_order_amount_usd - prev.avg_order_amount_usd : 0;
  const dOrd =
    cur && prev ? cur.total_orders - prev.total_orders : 0;

  const posActive = cur && prev ? cur.active_users >= prev.active_users : true;
  const posAmt =
    cur && prev ? cur.total_amount_usd >= prev.total_amount_usd : true;
  const posAvg =
    cur && prev ? cur.avg_order_amount_usd >= prev.avg_order_amount_usd : true;
  const posOrd = cur && prev ? cur.total_orders >= prev.total_orders : true;

  function fmtIntDelta(n: number, positive: boolean): string {
    const abs = Math.abs(Math.round(n));
    const s = abs.toLocaleString("ru-RU");
    return positive ? `${s} ↑` : `${s} ↓`;
  }

  function fmtUsdDelta(n: number, positive: boolean): string {
    const abs = Math.abs(Math.round(n));
    const s = abs.toLocaleString("ru-RU");
    return positive ? `${s} $ ↑` : `${s} $ ↓`;
  }

  function fmtUsdMain(n: number): string {
    return `${n.toLocaleString("ru-RU")} $`;
  }

  const fmtTotalUsersDelta = `${du >= 0 ? "+" : "−"}${Math.abs(Math.round(du)).toLocaleString("ru-RU")} ↑`;

  return (
    <div className="p-8 pb-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#e3e3e8] pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[26px] font-extrabold tracking-tight text-[#0a0a0a]">
            Статистика
          </h2>
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((o) => !o);
              }}
              className="flex items-center gap-2 rounded-[12px] border border-[#e4e4e4] bg-[#EDF0F1] px-4 py-2 text-[14px] font-medium text-[#3a3a3a] shadow-sm transition hover:border-[#d0d0d0]"
            >
              {PERIOD_LABELS[period]}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15" stroke="#151515" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 15L17 10" stroke="#151515" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {dropdownOpen ? (
              <div
                className="absolute left-0 z-20 mt-2 min-w-[200px] overflow-hidden rounded-[12px] border border-[#e8e8e8] bg-[#EDF0F1] py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {(["day", "week", "month", "custom"] as MarketPeriod[]).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      className="block w-full px-4 py-2.5 text-left text-[14px] text-[#0a0a0a] transition hover:bg-[#f5f5f7]"
                      onClick={() => {
                        setPeriod(p);
                        setDropdownOpen(false);
                        if (p === "custom") {
                          const d = defaultCustomDates();
                          setCustomFrom(d.from);
                          setCustomTo(d.to);
                        }
                      }}
                    >
                      {PERIOD_LABELS[p]}
                    </button>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {period === "custom" ? (
        <div className="mb-8 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[13px] text-[#6e6e6e]">
            С
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-xl border border-[#e4e4e4] bg-white px-3 py-2 text-[14px] text-[#0a0a0a]"
            />
          </label>
          <label className="flex flex-col gap-1 text-[13px] text-[#6e6e6e]">
            По
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-xl border border-[#e4e4e4] bg-white px-3 py-2 text-[14px] text-[#0a0a0a]"
            />
          </label>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      {loading || !cur ? (
        <div className="mb-8 text-[15px] text-[#6e6e6e]">Загрузка…</div>
      ) : (
        <>
          <section className="mb-8">
            <h3 className="mb-4 text-[17px] font-extrabold text-[#0a0a0a]">
              Пользователи
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                title="Общее кол-во пользователей"
                value={cur.total_users.toLocaleString("ru-RU")}
                deltaFormatted={fmtTotalUsersDelta}
                positive
                alwaysUp
              />
              <StatCard
                title="Активные пользователи"
                value={cur.active_users.toLocaleString("ru-RU")}
                deltaFormatted={fmtIntDelta(da, posActive)}
                positive={posActive}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-[17px] font-extrabold text-[#0a0a0a]">
              Заказы
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Общая сумма заказов"
                value={fmtUsdMain(cur.total_amount_usd)}
                deltaFormatted={fmtUsdDelta(dAmt, posAmt)}
                positive={posAmt}
              />
              <StatCard
                title="Средний чек"
                value={fmtUsdMain(cur.avg_order_amount_usd)}
                deltaFormatted={fmtUsdDelta(dAvg, posAvg)}
                positive={posAvg}
              />
              <StatCard
                title="Количество заявок"
                value={cur.total_orders.toLocaleString("ru-RU")}
                deltaFormatted={fmtIntDelta(dOrd, posOrd)}
                positive={posOrd}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
