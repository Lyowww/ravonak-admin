"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatTelegramDisplay, formatUserDate } from "@/lib/market-users-format";
import { formatSimIls, formatSimIlsSigned } from "@/lib/sim-bot-format";
import { formatMtDateTime } from "@/lib/mt-orders-format";
import type {
  SimBotBalanceAdjustBody,
  SimBotBalanceHistoryItem,
  SimBotBalanceHistoryResponse,
  SimBotOkDetailResponse,
  SimBotTariffItem,
  SimBotTariffsResponse,
  SimBotUserCreateBody,
  SimBotUserCreateResponse,
  SimBotUserDetailItem,
  SimBotUserDetailResponse,
  SimBotUserPatchBody,
} from "@/types/sim-bot-api";

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

function InnerBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e8e8ec] bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">
        {label}
      </p>
      <div className="mt-1 text-[15px] font-bold leading-snug text-[#0a0a0a]">{children}</div>
    </div>
  );
}

type SimBotAddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function SimBotAddUserModal({ open, onClose, onSuccess }: SimBotAddUserModalProps) {
  const router = useRouter();
  const [tariffs, setTariffs] = useState<SimBotTariffItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [tariffId, setTariffId] = useState("");
  const [debt, setDebt] = useState("0");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setUsername("");
      setAddress("");
      setTariffId("");
      setDebt("0");
      setErr(null);
      return;
    }
    let cancelled = false;
    async function loadT() {
      const r = await authenticatedFetchJson<SimBotTariffsResponse>("/api/sim-bot/tariffs", {
        cache: "no-store",
      });
      if (cancelled) return;
      if (r.ok && Array.isArray(r.data.items)) {
        setTariffs(r.data.items);
        setTariffId((prev) =>
          prev || r.data.items.length === 0 ? prev : String(r.data.items[0].id)
        );
      }
    }
    void loadT();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      setErr("Укажите ФИО и телефон");
      return;
    }
    const tid = Number(tariffId);
    if (!Number.isFinite(tid)) {
      setErr("Выберите тариф");
      return;
    }
    const debtNum = Number(String(debt).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(debtNum)) {
      setErr("Некорректная задолженность");
      return;
    }
    const body: SimBotUserCreateBody = {
      name: name.trim(),
      phone: phone.trim(),
      tariff_id: tid,
      debt: debtNum,
      address: address.trim(),
      username: username.trim(),
    };
    setLoading(true);
    setErr(null);
    const r = await authenticatedFetchJson<SimBotUserCreateResponse>("/api/sim-bot/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      return;
    }
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ececee] px-6 py-4">
          <h2 className="text-[20px] font-bold text-[#0a0a0a]">Добавление пользователя</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#9ca3af] hover:bg-black/5"
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {err ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-[13px] text-red-700">{err}</p>
          ) : null}
          <h3 className="text-[15px] font-bold text-[#0a0a0a]">Клиент</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-[12px] font-medium text-[#8a8a8a]">ФИО*</span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="Имя Фамилия"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Номер телефона*</span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="+999 99 999 99 99"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Telegram User Name</span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="@name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Тариф*</span>
              <select
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                value={tariffId}
                onChange={(e) => setTariffId(e.target.value)}
              >
                {tariffs.length === 0 ? (
                  <option value="">Загрузка…</option>
                ) : (
                  tariffs.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name_tarif || t.tarif || `Тариф #${t.id}`}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Задолженность (₪)</span>
              <input
                type="text"
                inputMode="decimal"
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-6">
            <h3 className="text-[15px] font-bold text-[#0a0a0a]">Адрес</h3>
            <label className="mt-3 block">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Адрес</span>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="Город, улица, дом"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="border-t border-[#ececee] px-6 py-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => void submit()}
            className="w-full rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white hover:bg-[#005a59] disabled:opacity-50"
          >
            {loading ? "Добавление…" : "Добавить пользователя"}
          </button>
        </div>
      </div>
    </div>
  );
}

type SimBotUserDetailModalProps = {
  userId: number | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
};

export function SimBotUserDetailModal({
  userId,
  open,
  onClose,
  onUserUpdated,
}: SimBotUserDetailModalProps) {
  const router = useRouter();
  const [item, setItem] = useState<SimBotUserDetailItem | null>(null);
  const [history, setHistory] = useState<SimBotBalanceHistoryItem[]>([]);
  const [tariffs, setTariffs] = useState<SimBotTariffItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [tariffId, setTariffId] = useState("");

  const [adjDelta, setAdjDelta] = useState("");
  const [adjNote, setAdjNote] = useState("");

  const loadDetail = useCallback(async () => {
    if (userId == null) return;
    setLoading(true);
    setErr(null);
    const [r1, r2, r3] = await Promise.all([
      authenticatedFetchJson<SimBotUserDetailResponse>(`/api/sim-bot/users/${userId}`, {
        cache: "no-store",
      }),
      authenticatedFetchJson<SimBotBalanceHistoryResponse>(
        `/api/sim-bot/users/${userId}/balance/history?limit=50`,
        { cache: "no-store" }
      ),
      authenticatedFetchJson<SimBotTariffsResponse>("/api/sim-bot/tariffs", { cache: "no-store" }),
    ]);
    setLoading(false);
    if (!r1.ok) {
      if (r1.unauthorized) router.replace("/");
      else setErr(r1.message);
      setItem(null);
      return;
    }
    const u = r1.data.item;
    setItem(u);
    setName(u.name ?? "");
    setPhone(u.phone ?? "");
    setUsername((u.username ?? "").replace(/^@/, ""));
    setAddress(u.address ?? "");
    setTariffId(String(u.tariff_id ?? ""));
    if (r2.ok && Array.isArray(r2.data.items)) setHistory(r2.data.items);
    else setHistory([]);
    if (r3.ok && Array.isArray(r3.data.items)) setTariffs(r3.data.items);
  }, [userId, router]);

  useEffect(() => {
    if (!open || userId == null) {
      setItem(null);
      setHistory([]);
      setEditing(false);
      setErr(null);
      setAdjDelta("");
      setAdjNote("");
      return;
    }
    void loadDetail();
  }, [open, userId, loadDetail]);

  function syncFromItem(u: SimBotUserDetailItem) {
    setName(u.name ?? "");
    setPhone(u.phone ?? "");
    setUsername((u.username ?? "").replace(/^@/, ""));
    setAddress(u.address ?? "");
    setTariffId(String(u.tariff_id ?? ""));
  }

  async function savePatch() {
    if (userId == null || !item) return;
    const tid = Number(tariffId);
    if (!Number.isFinite(tid)) {
      setErr("Выберите тариф");
      return;
    }
    setSaveLoading(true);
    setErr(null);
    const body: SimBotUserPatchBody = {
      name: name.trim(),
      phone: phone.trim(),
      username: username.trim(),
      address: address.trim(),
      tariff_id: tid,
    };
    const r = await authenticatedFetchJson<SimBotOkDetailResponse>(
      `/api/sim-bot/users/${userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSaveLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      return;
    }
    setEditing(false);
    await loadDetail();
    onUserUpdated();
  }

  async function toggleNumber(active: boolean) {
    if (userId == null) return;
    setStatusLoading(true);
    setErr(null);
    const r = await authenticatedFetchJson<SimBotOkDetailResponse>(
      `/api/sim-bot/users/${userId}/number/active?active=${active ? "true" : "false"}`,
      { method: "POST" }
    );
    setStatusLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      return;
    }
    await loadDetail();
    onUserUpdated();
  }

  async function submitAdjust() {
    if (userId == null) return;
    const delta = Number(String(adjDelta).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(delta) || delta === 0) {
      setErr("Введите ненулевую сумму изменения");
      return;
    }
    setAdjustLoading(true);
    setErr(null);
    const body: SimBotBalanceAdjustBody = { delta, note: adjNote.trim() };
    const r = await authenticatedFetchJson<SimBotOkDetailResponse>(
      `/api/sim-bot/users/${userId}/balance/adjust`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setAdjustLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      return;
    }
    setAdjDelta("");
    setAdjNote("");
    await loadDetail();
    onUserUpdated();
  }

  if (!open || userId == null) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
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
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
            {err ? (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-[13px] text-red-700">{err}</p>
            ) : null}

            <h3 className="text-[15px] font-bold text-[#0a0a0a]">Клиент</h3>
            {!editing ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InnerBox label="ID">{item.id}</InnerBox>
                <InnerBox label="Telegram ID">{item.tg_id}</InnerBox>
                <InnerBox label="Пользователь">{item.name || "—"}</InnerBox>
                <InnerBox label="Номер телефона">{item.phone || "—"}</InnerBox>
                <div className="sm:col-span-2">
                  <InnerBox label="Telegram User Name">
                    {formatTelegramDisplay(username)}
                  </InnerBox>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InnerBox label="ID">{item.id}</InnerBox>
                  <InnerBox label="Telegram ID">{item.tg_id}</InnerBox>
                </div>
                <label className="block">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Пользователь</span>
                  <input
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Номер телефона</span>
                  <input
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Telegram User Name</span>
                  <input
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@name"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Тариф</span>
                  <select
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                    value={tariffId}
                    onChange={(e) => setTariffId(e.target.value)}
                  >
                    {tariffs.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name_tarif || t.tarif || `Тариф #${t.id}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-[15px] font-bold text-[#0a0a0a]">Адрес</h3>
              {!editing ? (
                <div className="mt-2 rounded-2xl border border-[#e8e8ec] bg-white px-4 py-3 shadow-sm">
                  <p className="text-[15px] font-bold leading-relaxed whitespace-pre-wrap text-[#0a0a0a]">
                    {item.address?.trim() ? item.address : "—"}
                  </p>
                </div>
              ) : (
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              )}
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-[#ececee] bg-[#fafafa] p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium text-[#8a8a8a]">Тариф</p>
                <p className="mt-1 font-semibold text-[#0a0a0a]">{item.tariff_name || "—"}</p>
                <p className="text-[13px] text-[#6e6e6e]">{formatSimIls(item.tariff_ils)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8a8a8a]">Статус номера</p>
                <p className="mt-1 font-semibold text-[#0a0a0a]">
                  {item.number_active ? "Активен" : "Заморозка"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8a8a8a]">Баланс</p>
                <p className="mt-1 font-semibold text-[#0a0a0a]">
                  {formatSimIls(item.balance_amount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8a8a8a]">Задолженность</p>
                <p className="mt-1 font-semibold text-[#0a0a0a]">
                  {formatSimIlsSigned(item.debt_display)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] font-medium text-[#8a8a8a]">Регистрация</p>
                <p className="mt-1 text-[14px] font-medium text-[#0a0a0a]">
                  {formatUserDate(item.created_at)}
                </p>
              </div>
            </div>

            {!editing ? (
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => void toggleNumber(!item.number_active)}
                  className="rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-2.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-[#ececee] disabled:opacity-50"
                >
                  {statusLoading
                    ? "…"
                    : item.number_active
                      ? "Заморозить номер"
                      : "Активировать номер"}
                </button>
              </div>
            ) : null}

            <div className="mt-8 border-t border-[#ececee] pt-6">
              <h3 className="text-[15px] font-bold text-[#0a0a0a]">Корректировка баланса</h3>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Изменение (₪)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-2.5 text-[14px]"
                    placeholder="Напр. −100 или 50"
                    value={adjDelta}
                    onChange={(e) => setAdjDelta(e.target.value)}
                    disabled={editing}
                  />
                </label>
                <label className="min-w-0 flex-[2]">
                  <span className="text-[12px] font-medium text-[#8a8a8a]">Комментарий</span>
                  <input
                    className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-2.5 text-[14px]"
                    value={adjNote}
                    onChange={(e) => setAdjNote(e.target.value)}
                    disabled={editing}
                  />
                </label>
                <button
                  type="button"
                  disabled={adjustLoading || editing}
                  onClick={() => void submitAdjust()}
                  className="rounded-2xl bg-[#006c6b] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#005a59] disabled:opacity-50"
                >
                  {adjustLoading ? "…" : "Применить"}
                </button>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-[15px] font-bold text-[#0a0a0a]">История баланса</h3>
                <div className="mt-3 max-h-[220px] space-y-2 overflow-y-auto">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-xl border border-[#ececee] bg-[#f8f8fa] px-3 py-2.5 text-[13px]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#0a0a0a]">
                          {formatSimIlsSigned(h.delta)}
                        </span>
                        <span className="text-[12px] text-[#8a8a8a]">
                          {formatMtDateTime(h.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[#5a5a5e]">
                        Баланс после: {formatSimIls(h.balance_after)}
                      </p>
                      {h.note ? (
                        <p className="mt-1 text-[12px] text-[#3a3a3e]">{h.note}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 border-t border-[#ececee] pt-5">
              {editing ? (
                <>
                  <button
                    type="button"
                    disabled={saveLoading}
                    onClick={() => void savePatch()}
                    className="w-full rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white hover:bg-[#005a59] disabled:opacity-50"
                  >
                    {saveLoading ? "Сохранение…" : "Сохранить изменения"}
                  </button>
                  <button
                    type="button"
                    disabled={saveLoading}
                    onClick={() => {
                      setEditing(false);
                      syncFromItem(item);
                      setErr(null);
                    }}
                    className="w-full py-2 text-[14px] font-medium text-[#006c6b] underline"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    syncFromItem(item);
                  }}
                  className="w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] py-3.5 text-[15px] font-semibold text-[#0a0a0a] hover:bg-[#ececee]"
                >
                  Редактировать профиль
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
