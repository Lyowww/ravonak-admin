"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatCount, formatIls, formatUsd } from "@/lib/money-transfer-format";
import { parseMoneyTransferStatisticsResponse } from "@/lib/parse-money-transfer-statistics";
import type {
  MoneyTransferPeriod,
  MoneyTransferStatisticsResponse,
} from "@/types/money-transfer-statistics";

const PERIOD_LABELS: Record<MoneyTransferPeriod, string> = {
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

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex min-h-[104px] flex-col justify-between rounded-2xl border border-[#ececee] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <p className="text-[12px] font-medium uppercase tracking-wide text-[#8a8a8a]">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-[26px] font-bold tabular-nums leading-none tracking-tight text-[#0a0a0a]">
          {value}
        </span>
        <span className="shrink-0 text-[20px] font-semibold text-[#6e6e6e]">{unit}</span>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h3 className="mb-4 text-[17px] font-semibold text-[#0a0a0a]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function MoneyTransferStatisticsView() {
  const router = useRouter();
  const [period, setPeriod] = useState<MoneyTransferPeriod>("week");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MoneyTransferStatisticsResponse | null>(null);
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
    if (period === "custom" && (!customFrom || !customTo)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (period === "custom") {
      params.set("period", "custom");
      params.set("date_from", dateStartIso(customFrom));
      params.set("date_to", dateEndIso(customTo));
    } else {
      params.set("period", period);
    }

    const r = await authenticatedFetchJson<unknown>(
      `/api/money-transfer/statistics?${params.toString()}`,
      { cache: "no-store" }
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setError(r.message);
      setData(null);
      return;
    }
    const parsed = parseMoneyTransferStatisticsResponse(r.data);
    if (!parsed) {
      setError(
        "Ответ сервера не похож на статистику доставки денег. Попробуйте обновить страницу позже."
      );
      setData(null);
      return;
    }
    setData(parsed);
  }, [period, customFrom, customTo, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const rangeLabel = data
    ? (() => {
        const a = new Date(data.date_from);
        const b = new Date(data.date_to);
        const dates =
          Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())
            ? null
            : `${a.toLocaleDateString("ru-RU")} — ${b.toLocaleDateString("ru-RU")}`;
        return dates ? `${data.period} · ${dates}` : String(data.period);
      })()
    : null;

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
                {(["day", "week", "month", "custom"] as MoneyTransferPeriod[]).map(
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
        {rangeLabel ? (
          <p className="text-[13px] text-[#8a8a8a]">{rangeLabel}</p>
        ) : null}
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
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      {loading || !data ? (
        <p className="text-[15px] text-[#6e6e6e]">Загрузка…</p>
      ) : (
        <div className="rounded-2xl border border-[#e8e8ec] bg-white p-6 shadow-sm md:p-8">
          <Section title="Резерв Самарканда">
            <MetricCard
              label="Баланс"
              value={formatUsd(data.reserve_samarkand_usd)}
              unit="$"
            />
          </Section>

          <Section title="Сумма всех заказов">
            <MetricCard
              label="В шекелях"
              value={formatIls(data.all_orders_ils)}
              unit="₪"
            />
            <MetricCard
              label="В долларах"
              value={formatUsd(data.all_orders_usd)}
              unit="$"
            />
          </Section>

          <Section title="Сумма собранных заказов">
            <MetricCard
              label="Количество"
              value={formatCount(data.collected_orders_count)}
              unit="ед."
            />
            <MetricCard
              label="В шекелях"
              value={formatIls(data.collected_orders_ils)}
              unit="₪"
            />
            <MetricCard
              label="В долларах"
              value={formatUsd(data.collected_orders_usd)}
              unit="$"
            />
          </Section>

          <Section title="Не собранные заказы">
            <MetricCard
              label="Количество"
              value={formatCount(data.not_collected_orders_count)}
              unit="ед."
            />
            <MetricCard
              label="В шекелях"
              value={formatIls(data.not_collected_orders_ils)}
              unit="₪"
            />
            <MetricCard
              label="В долларах"
              value={formatUsd(data.not_collected_orders_usd)}
              unit="$"
            />
          </Section>

          <Section title="Сумма долгов клиентов">
            <MetricCard
              label="В шекелях"
              value={formatIls(data.clients_debt_ils)}
              unit="₪"
            />
            <MetricCard
              label="В долларах"
              value={formatUsd(data.clients_debt_usd)}
              unit="$"
            />
          </Section>
        </div>
      )}
    </div>
  );
}
