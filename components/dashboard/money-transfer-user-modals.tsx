"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetchJson } from "@/lib/authenticated-fetch";
import { formatTelegramDisplay, formatUserDate } from "@/lib/market-users-format";
import { formatMtDateTime, formatMtMoney } from "@/lib/mt-orders-format";
import type { MoneyTransferOrderItem } from "@/types/money-transfer-orders-api";
import type {
  MoneyTransferUserCreateBody,
  MoneyTransferUserDetailResponse,
  MoneyTransferUserItem,
  MoneyTransferUserPatchBody,
} from "@/types/money-transfer-users-api";

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

function sectionTitle(text: string) {
  return (
    <h3 className="text-[15px] font-bold text-[#0a0a0a]">{text}</h3>
  );
}

type MtUserDetailModalProps = {
  userId: number | null;
  open: boolean;
  onClose: () => void;
  /** «Создание заказа»: кнопки «Создать заказ» и «Редактировать профиль». */
  showCreateOrderActions?: boolean;
  onProceedCreateOrder?: (user: MoneyTransferUserItem) => void;
  onUserUpdated?: () => void;
};

export function MtUserDetailModal({
  userId,
  open,
  onClose,
  showCreateOrderActions = false,
  onProceedCreateOrder,
  onUserUpdated,
}: MtUserDetailModalProps) {
  const router = useRouter();
  const [item, setItem] = useState<MoneyTransferUserItem | null>(null);
  const [recentOrders, setRecentOrders] = useState<MoneyTransferOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");

  const load = useCallback(async () => {
    if (userId == null) return;
    setLoading(true);
    setErr(null);
    const r = await authenticatedFetchJson<MoneyTransferUserDetailResponse>(
      `/api/money-transfer/users/${userId}`,
      { cache: "no-store" }
    );
    setLoading(false);
    if (!r.ok) {
      if (r.unauthorized) router.replace("/");
      else setErr(r.message);
      setItem(null);
      setRecentOrders([]);
      return;
    }
    const u = r.data.item;
    setItem(u);
    setRecentOrders(Array.isArray(r.data.recent_orders) ? r.data.recent_orders : []);
    setFullName(u.full_name ?? "");
    setPhone(u.phone_number ?? "");
    setUsername((u.username ?? "").replace(/^@/, ""));
    setAddress(u.address ?? "");
  }, [userId, router]);

  useEffect(() => {
    if (!open || userId == null) {
      setItem(null);
      setRecentOrders([]);
      setEditing(false);
      setErr(null);
      return;
    }
    void load();
  }, [open, userId, load]);

  function syncFromItem(u: MoneyTransferUserItem) {
    setFullName(u.full_name ?? "");
    setPhone(u.phone_number ?? "");
    setUsername((u.username ?? "").replace(/^@/, ""));
    setAddress(u.address ?? "");
  }

  async function save() {
    if (userId == null || !item) return;
    setSaveLoading(true);
    setErr(null);
    const body: MoneyTransferUserPatchBody = {
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      username: username.trim() || undefined,
      address: address.trim(),
    };
    const r = await authenticatedFetchJson<MoneyTransferUserDetailResponse>(
      `/api/money-transfer/users/${userId}`,
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
    if (r.data.item) {
      setItem(r.data.item);
      syncFromItem(r.data.item);
      setRecentOrders((prev) => {
        const ro = r.data.recent_orders;
        return Array.isArray(ro) ? ro : prev;
      });
    } else {
      await load();
    }
    setEditing(false);
    onUserUpdated?.();
  }

  if (!open || userId == null) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
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

            <div className="space-y-5">
              <div>
                {sectionTitle("Клиент")}
                <div className="mt-3 space-y-3">
                  <FieldRow label="ID" value={String(item.id)} readonly />
                  <FieldRow
                    label="Пользователь"
                    value={fullName}
                    onChange={setFullName}
                    readonly={!editing}
                    placeholder="Имя Фамилия"
                  />
                  <FieldRow
                    label="Номер телефона"
                    value={phone}
                    onChange={setPhone}
                    readonly={!editing}
                    placeholder="+999 99 999 99 99"
                  />
                  <div>
                    <p className="text-[12px] font-medium text-[#8a8a8a]">Telegram User Name</p>
                    {editing ? (
                      <input
                        className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-2.5 text-[14px] outline-none focus:border-[#d0d0d4]"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@name"
                      />
                    ) : (
                      <p className="mt-1 text-[14px] font-medium text-[#0a0a0a]">
                        {formatTelegramDisplay(username)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {sectionTitle("Адрес")}
                <p className="mt-1 text-[12px] text-[#8a8a8a]">Адрес забора денег</p>
                {editing ? (
                  <textarea
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px] outline-none focus:border-[#d0d0d4]"
                    placeholder="Город, улица, дом"
                  />
                ) : (
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-[#e8e8ec] bg-[#f8f8fa] px-4 py-3 text-[14px] text-[#0a0a0a]">
                    {item.address?.trim() ? item.address : "—"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#ececee] bg-[#fafafa] p-4 text-[13px]">
                <div>
                  <p className="text-[11px] font-medium text-[#8a8a8a]">Заказов всего</p>
                  <p className="mt-0.5 font-semibold text-[#0a0a0a]">{item.total_orders}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#8a8a8a]">Активных</p>
                  <p className="mt-0.5 font-semibold text-[#0a0a0a]">{item.active_orders}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#8a8a8a]">Долг $</p>
                  <p className="mt-0.5 font-semibold text-[#0a0a0a]">{formatMtMoney(item.debt_usd)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#8a8a8a]">Долг ₪</p>
                  <p className="mt-0.5 font-semibold text-[#0a0a0a]">{formatMtMoney(item.debt_ils)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-medium text-[#8a8a8a]">Регистрация</p>
                  <p className="mt-0.5 font-medium text-[#0a0a0a]">
                    {formatUserDate(item.registered_at)}
                  </p>
                </div>
              </div>
            </div>

            {recentOrders.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-[15px] font-bold text-[#0a0a0a]">Последние заказы</h3>
                <div className="mt-3 max-h-[220px] space-y-2 overflow-y-auto">
                  {recentOrders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-xl border border-[#ececee] bg-[#f8f8fa] px-3 py-2.5 text-[13px]"
                    >
                      <p className="font-semibold text-[#0a0a0a]">№ {o.order_code}</p>
                      <p className="text-[12px] text-[#8a8a8a]">
                        {formatMtDateTime(o.created_at)} · {o.status_label || "—"}
                      </p>
                      <p className="mt-1 text-[12px] text-[#5a5a5e]">
                        {formatMtMoney(o.amount_usd)} $ · {formatMtMoney(o.amount_ils)} ₪
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 border-t border-[#ececee] pt-5">
              {editing ? (
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={() => void save()}
                  className="w-full rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#005a59] disabled:opacity-50"
                >
                  {saveLoading ? "Сохранение…" : "Сохранить изменения"}
                </button>
              ) : showCreateOrderActions ? (
                <>
                  <button
                    type="button"
                    onClick={() => onProceedCreateOrder?.(item)}
                    className="w-full rounded-2xl bg-[#006c6b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#005a59]"
                  >
                    Создать заказ
                  </button>
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
              {editing ? (
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
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
  readonly,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readonly?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#8a8a8a]">{label}</p>
      {readonly ? (
        <p className="mt-1 text-[14px] font-medium text-[#0a0a0a]">{value || "—"}</p>
      ) : (
        <input
          className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-2.5 text-[14px] outline-none focus:border-[#d0d0d4]"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

type MtAddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function MtAddUserModal({ open, onClose, onSuccess }: MtAddUserModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFullName("");
      setPhone("");
      setUsername("");
      setAddress("");
      setErr(null);
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (!fullName.trim() || !phone.trim()) {
      setErr("Заполните ФИО и номер телефона");
      return;
    }
    setLoading(true);
    setErr(null);
    const body: MoneyTransferUserCreateBody = {
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      username: username.trim() || undefined,
      address: address.trim() || undefined,
    };
    const r = await authenticatedFetchJson<{ item?: MoneyTransferUserItem }>(
      "/api/money-transfer/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
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
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
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
          {sectionTitle("Клиент")}
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className="text-[12px] font-medium text-[#8a8a8a]">ФИО*</span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="Имя Фамилия"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Номер телефона*</span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="+999 99 999 99 99"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-[#8a8a8a]">Telegram User Name</span>
              <input
                className="mt-1 w-full rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                placeholder="@name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-6">
            {sectionTitle("Адрес")}
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
