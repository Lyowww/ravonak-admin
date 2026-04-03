"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatUsd, formatIls } from "@/lib/money-transfer-format";
import { parseMoneyTransferStatisticsResponse } from "@/lib/parse-money-transfer-statistics";
import type {
  MoneyTransferPeriod,
  MoneyTransferStatisticsResponse,
} from "@/types/money-transfer-statistics";
import type { SamarkandReserveCurrentResponse } from "@/types/data-admin-api";

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

function formatRangeLabel(fromIso: string, toIso: string): string {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "—";
  const fa = a.toLocaleDateString("ru-RU");
  const fb = b.toLocaleDateString("ru-RU");
  return fa === fb ? fa : `${fa} - ${fb}`;
}

function fmtMoneyUsd(n: number): string {
  return `${formatUsd(n)} $`;
}

function fmtMoneyIls(n: number): string {
  return `${formatIls(n)} ₪`;
}

function fmtDash(): string {
  return "—";
}

type BreakdownRow = {
  orders_usd: number;
  orders_ils: number;
  commission_usd: number | null;
  delivery_usd: number | null;
  total_usd: number;
};

function rowAll(mt: MoneyTransferStatisticsResponse): BreakdownRow {
  return {
    orders_usd: mt.all_orders_usd,
    orders_ils: mt.all_orders_ils,
    commission_usd: null,
    delivery_usd: null,
    total_usd: mt.all_orders_usd,
  };
}

function rowCollected(mt: MoneyTransferStatisticsResponse): BreakdownRow {
  return {
    orders_usd: mt.collected_orders_usd,
    orders_ils: mt.collected_orders_ils,
    commission_usd: null,
    delivery_usd: null,
    total_usd: mt.collected_orders_usd,
  };
}

function rowUncollected(mt: MoneyTransferStatisticsResponse): BreakdownRow {
  return {
    orders_usd: mt.not_collected_orders_usd,
    orders_ils: mt.not_collected_orders_ils,
    commission_usd: null,
    delivery_usd: null,
    total_usd: mt.not_collected_orders_usd,
  };
}

function StatBox({
  title,
  value,
  valueClassName,
}: {
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ececee] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] font-medium leading-snug text-[#8a8a8a]">{title}</p>
      <p
        className={`mt-2 text-[18px] font-bold tabular-nums leading-tight text-[#0a0a0a] sm:text-[20px] ${valueClassName ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function BreakdownCells({ row }: { row: BreakdownRow }) {
  const cells: { label: string; value: string; bold?: boolean }[] = [
    { label: "Заказы $", value: fmtMoneyUsd(row.orders_usd) },
    { label: "Заказы ₪", value: fmtMoneyIls(row.orders_ils) },
    {
      label: "Комиссия",
      value:
        row.commission_usd == null ? fmtDash() : fmtMoneyUsd(row.commission_usd),
    },
    {
      label: "Доставка",
      value: row.delivery_usd == null ? fmtDash() : fmtMoneyUsd(row.delivery_usd),
    },
    { label: "Итого", value: fmtMoneyUsd(row.total_usd), bold: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-[#ececee] bg-white px-3 py-3 shadow-sm"
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">
            {c.label}
          </p>
          <p
            className={`mt-1 text-[15px] tabular-nums text-[#0a0a0a] ${
              c.bold ? "font-bold" : "font-semibold"
            }`}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DataReportsView() {
  const router = useRouter();
  const [period, setPeriod] = useState<MoneyTransferPeriod>("week");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mt, setMt] = useState<MoneyTransferStatisticsResponse | null>(null);
  const [samarkandData, setSamarkandData] = useState<SamarkandReserveCurrentResponse | null>(
    null
  );
  const [samarkandErr, setSamarkandErr] = useState(false);
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

    const qs = params.toString();
    const [rMt, rSam] = await Promise.all([
      authenticatedFetchJson<unknown>(`/api/money-transfer/statistics?${qs}`, {
        cache: "no-store",
      }),
      authenticatedFetchJson<SamarkandReserveCurrentResponse>(
        "/api/data/samarkand-reserve/current",
        { cache: "no-store" }
      ),
    ]);

    setLoading(false);

    if (!rMt.ok) {
      if (rMt.unauthorized) router.replace("/");
      else setError(rMt.message);
      setMt(null);
      setSamarkandData(null);
      setSamarkandErr(true);
      return;
    }

    const parsed = parseMoneyTransferStatisticsResponse(rMt.data);
    if (!parsed) {
      setError(
        "Ответ статистики доставки денег не распознан. Проверьте формат JSON."
      );
      setMt(null);
      setSamarkandData(null);
      setSamarkandErr(true);
      return;
    }

    setMt(parsed);

    if (rSam.ok) {
      setSamarkandData(rSam.data);
      setSamarkandErr(false);
    } else {
      setSamarkandData(null);
      setSamarkandErr(true);
      if (rSam.unauthorized) router.replace("/");
    }
  }, [period, customFrom, customTo, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const rangeText = mt
    ? formatRangeLabel(mt.date_from, mt.date_to)
    : period === "custom" && customFrom && customTo
      ? formatRangeLabel(dateStartIso(customFrom), dateEndIso(customTo))
      : null;

  const samarkandUsd =
    samarkandData != null
      ? samarkandData.amount_usd
      : mt != null && samarkandErr
        ? mt.reserve_samarkand_usd
        : null;

  return (
    <div className="min-h-full bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mb-6 rounded-xl border border-[#e8e8ec] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#5a5a5e] shadow-sm">
        Раздел «Отчёты» собран из доступных API:{" "}
        <strong className="font-semibold text-[#0a0a0a]">
          статистика доставки денег
        </strong>{" "}
        (период и суммы заказов) и{" "}
        <strong className="font-semibold text-[#0a0a0a]">
          текущий резерв Самарканда
        </strong>{" "}
        (раздел «Данные»). Отдельного endpoint «/data/reports» нет — поля без
        источника показываются как «—».
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#e3e3e8] pb-6">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a]">Отчеты</h1>
        <div className="flex flex-wrap items-center gap-3">
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
                className="absolute right-0 z-20 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {(["day", "week", "month", "custom"] as MoneyTransferPeriod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-[14px] text-[#0a0a0a] transition hover:bg-[#f5f5f7]"
                    onClick={() => {
                      setPeriod(p);
                      setDropdownOpen(false);
                      if (p === "custom") {
                        const x = defaultCustomDates();
                        setCustomFrom(x.from);
                        setCustomTo(x.to);
                      }
                    }}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {rangeText ? (
            <span className="rounded-full border border-[#e4e4e4] bg-white px-4 py-2 text-[13px] font-medium text-[#6e6e6e] shadow-sm">
              {rangeText}
            </span>
          ) : null}
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
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      {loading || !mt ? (
        <p className="text-[15px] text-[#6e6e6e]">Загрузка…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="mb-4 text-[17px] font-semibold text-[#0a0a0a]">
              Текущие балансы
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatBox
                title="Долг перед Равшаном"
                value={fmtMoneyUsd(mt.clients_debt_usd)}
              />
              <StatBox title="Долг перед Фирмами" value={fmtDash()} />
              <StatBox title="Остаток собственных средств" value={fmtDash()} />
            </div>
            <p className="mt-2 text-[12px] text-[#9ca3af]">
              «Долг перед Равшаном» показывает долг клиентов в $ из статистики
              доставки. Остальные поля ждут отдельного API.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-[17px] font-semibold text-[#0a0a0a]">Заказы</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatBox title="Всего невыданных" value={fmtDash()} />
              <StatBox
                title="Всего несобранных"
                value={fmtMoneyUsd(mt.not_collected_orders_usd)}
              />
              <StatBox
                title="Всего собранных но не выданных"
                value={fmtMoneyUsd(mt.collected_orders_usd)}
              />
              <StatBox
                title="Остаток в Самарканде"
                value={
                  samarkandUsd != null && Number.isFinite(samarkandUsd)
                    ? fmtMoneyUsd(samarkandUsd)
                    : fmtDash()
                }
              />
            </div>
            {samarkandErr && samarkandData == null ? (
              <p className="mt-2 text-[12px] text-[#9ca3af]">
                Резерв Самарканда: при ошибке загрузки /data/samarkand-reserve/current
                показано значение из статистики доставки.
              </p>
            ) : null}
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-[17px] font-semibold text-[#0a0a0a]">
              {rangeText || "Период"}
            </h2>
            <div className="mb-4 max-w-md">
              <StatBox title="Прибыль" value={fmtDash()} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatBox title="Оборот брутто" value={fmtMoneyUsd(mt.all_orders_usd)} />
              <StatBox title="Оборот нетто" value={fmtMoneyUsd(mt.all_orders_usd)} />
              <StatBox
                title="Несобранные"
                value={fmtMoneyUsd(mt.not_collected_orders_usd)}
              />
              <StatBox title="Невыданные" value={fmtDash()} />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-6 text-[17px] font-semibold text-[#0a0a0a]">
              Детализация
            </h2>
            <div className="space-y-8">
              <div>
                <p className="mb-3 text-[14px] font-semibold text-[#0a0a0a]">
                  Заказов всего
                </p>
                <BreakdownCells row={rowAll(mt)} />
              </div>
              <div>
                <p className="mb-3 text-[14px] font-semibold text-[#0a0a0a]">
                  Из них собранные
                </p>
                <BreakdownCells row={rowCollected(mt)} />
              </div>
              <div>
                <p className="mb-3 text-[14px] font-semibold text-[#0a0a0a]">
                  Из них несобранные
                </p>
                <BreakdownCells row={rowUncollected(mt)} />
              </div>
              <div>
                <p className="mb-3 text-[14px] font-semibold text-[#0a0a0a]">
                  Доставлено до адреса
                </p>
                <div className="max-w-[200px] rounded-2xl border border-[#ececee] bg-white p-5 shadow-sm">
                  <p className="text-[12px] font-medium text-[#8a8a8a]">Кол-во</p>
                  <p className="mt-2 text-[22px] font-bold tabular-nums text-[#0a0a0a]">
                    {fmtDash()}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
