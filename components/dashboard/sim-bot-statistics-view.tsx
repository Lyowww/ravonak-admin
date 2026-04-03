"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { previousPeriodRange } from "@/lib/comparison-period";
import { formatSimIls } from "@/lib/sim-bot-format";
import { simBotStatsWindow } from "@/lib/sim-bot-period-windows";
import type { SimBotPeriod, SimBotStatisticsResponse } from "@/types/sim-bot-api";
import { StatCard } from "./stat-card";

const PERIOD_LABELS: Record<SimBotPeriod, string> = {
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

function parseStats(raw: unknown): SimBotStatisticsResponse | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const total_users = Number(o.total_users);
  const new_numbers = Number(o.new_numbers);
  const deactivated_sim = Number(o.deactivated_sim);
  if (
    !Number.isFinite(total_users) ||
    !Number.isFinite(new_numbers) ||
    !Number.isFinite(deactivated_sim)
  ) {
    return null;
  }
  const earnings_ils = o.earnings_ils;
  return {
    total_users,
    new_numbers,
    earnings_ils:
      typeof earnings_ils === "string" || typeof earnings_ils === "number"
        ? earnings_ils
        : "0",
    deactivated_sim,
  };
}

export function SimBotStatisticsView() {
  const router = useRouter();
  const [period, setPeriod] = useState<SimBotPeriod>("week");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cur, setCur] = useState<SimBotStatisticsResponse | null>(null);
  const [prev, setPrev] = useState<SimBotStatisticsResponse | null>(null);
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
    const w = simBotStatsWindow(period, customFrom, customTo);
    if (!w) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const paramsCur = new URLSearchParams();
    paramsCur.set("period", "custom");
    paramsCur.set("date_from", w.from);
    paramsCur.set("date_to", w.to);

    const r1 = await authenticatedFetchJson<unknown>(
      `/api/sim-bot/statistics?${paramsCur.toString()}`,
      { cache: "no-store" }
    );

    const pr = previousPeriodRange(w.from, w.to);
    const paramsPrev = new URLSearchParams();
    paramsPrev.set("period", "custom");
    paramsPrev.set("date_from", pr.from);
    paramsPrev.set("date_to", pr.to);

    const r2 = await authenticatedFetchJson<unknown>(
      `/api/sim-bot/statistics?${paramsPrev.toString()}`,
      { cache: "no-store" }
    );

    setLoading(false);

    if (!r1.ok) {
      if (r1.unauthorized) router.replace("/");
      else setError(r1.message);
      setCur(null);
      setPrev(null);
      return;
    }

    const c = parseStats(r1.data);
    const p = r2.ok ? parseStats(r2.data) : null;

    if (!c) {
      setError("Некорректный ответ статистики SIM-карта.");
      setCur(null);
      setPrev(null);
      return;
    }

    setCur(c);
    setPrev(p);
  }, [period, customFrom, customTo, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const du = cur && prev ? cur.total_users - prev.total_users : 0;
  const dn = cur && prev ? cur.new_numbers - prev.new_numbers : 0;
  const parseE = (x: SimBotStatisticsResponse) => {
    const s = String(x.earnings_ils).replace(/,/g, ".");
    const n = Number(s.replace(/^[+-]/, ""));
    return Number.isFinite(n)
      ? n * (String(x.earnings_ils).trim().startsWith("-") ? -1 : 1)
      : 0;
  };
  const de = cur && prev ? parseE(cur) - parseE(prev) : 0;
  const dd = cur && prev ? cur.deactivated_sim - prev.deactivated_sim : 0;

  const posUsers = cur && prev ? du >= 0 : true;
  const posNew = cur && prev ? dn >= 0 : true;
  const posEarn = cur && prev ? de >= 0 : true;
  const posDeact = cur && prev ? dd <= 0 : true;

  function fmtIntDelta(n: number, positive: boolean): string {
    const abs = Math.abs(Math.round(n));
    const s = abs.toLocaleString("ru-RU");
    return positive ? `${s} ↑` : `${s} ↓`;
  }

  function fmtIlsDelta(n: number, positive: boolean): string {
    const abs = Math.abs(n);
    const s = abs.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return positive ? `${s} ₪ ↑` : `${s} ₪ ↓`;
  }

  const fmtTotalUsersDelta =
    prev == null
      ? "—"
      : `${du >= 0 ? "+" : "−"}${Math.abs(Math.round(du)).toLocaleString("ru-RU")} ↑`;

  return (
    <div className="min-h-full bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#e3e3e8] pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">
            Статистика
          </h1>
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((o) => !o);
              }}
              className="flex items-center gap-2 rounded-full border border-[#e4e4e4] bg-white px-4 py-2 text-[14px] font-medium text-[#3a3a3a] shadow-sm transition hover:border-[#d0d0d0]"
            >
              {PERIOD_LABELS[period]}
              <span className="text-[10px] text-zinc-500">▼</span>
            </button>
            {dropdownOpen ? (
              <div
                className="absolute left-0 z-20 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {(["day", "week", "month", "custom"] as SimBotPeriod[]).map((p) => (
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
                ))}
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
            <h2 className="mb-4 text-[17px] font-semibold text-[#0a0a0a]">Пользователи</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                title="Общее кол-во пользователей"
                value={cur.total_users.toLocaleString("ru-RU")}
                deltaFormatted={fmtTotalUsersDelta}
                positive
                alwaysUp
              />
              <StatCard
                title="Новые номера"
                value={cur.new_numbers.toLocaleString("ru-RU")}
                deltaFormatted={
                  prev == null ? "—" : fmtIntDelta(dn, posNew)
                }
                positive={posNew}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-[17px] font-semibold text-[#0a0a0a]">SIM-карта</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                title="Доход (₪)"
                value={formatSimIls(cur.earnings_ils)}
                deltaFormatted={
                  prev == null ? "—" : fmtIlsDelta(de, posEarn)
                }
                positive={posEarn}
              />
              <StatCard
                title="Деактивированные SIM"
                value={cur.deactivated_sim.toLocaleString("ru-RU")}
                deltaFormatted={
                  prev == null ? "—" : fmtIntDelta(dd, posDeact)
                }
                positive={posDeact}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
