"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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

/** Figma node «Пользователь» (money-transfer users): colors & cells */
function figmaSectionTitle(text: string) {
  return <h3 className="text-[15px] font-bold text-black">{text}</h3>;
}

function FigmaFieldCell({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-[12px] leading-tight text-[#888888]">{label}</p>
      <div className="mt-1.5 text-[14px] leading-snug text-black">{children}</div>
    </div>
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
  /** Скрыть блок статистики и «Последние заказы» (карточка как в разделе пользователей). */
  profileOnly?: boolean;
};

export function MtUserDetailModal({
  userId,
  open,
  onClose,
  showCreateOrderActions = false,
  onProceedCreateOrder,
  onUserUpdated,
  profileOnly = false,
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

  const figmaProfileReadonly = profileOnly && !editing;
  const modalPad = profileOnly ? "px-8" : "px-6";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white shadow-2xl ${profileOnly ? "max-w-[680px] rounded-2xl" : "max-w-[640px] rounded-3xl"
          }`}
      >
        <div className={`flex items-center justify-between pb-2 pt-6 ${modalPad}`}>
          <h2
            className={`font-bold tracking-tight text-black ${profileOnly ? "text-[24px] leading-tight" : "text-[22px]"
              }`}
          >
            Пользователь
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#888888] hover:bg-black/[0.04]"
            aria-label="Закрыть"
          >
            <IconClose />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-[#888888]">
            Загрузка…
          </div>
        ) : err && !item ? (
          <div className={`${modalPad} py-8 text-center text-red-600`}>{err}</div>
        ) : item ? (
          <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto py-4 ${modalPad}`}>
            {err ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[13px] text-red-700">
                {err}
              </p>
            ) : null}

            <div className="space-y-0">
              {figmaProfileReadonly ? (
                <>
                  <div>
                    {figmaSectionTitle("Клиент")}
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
                      <div className="sm:col-span-2">
                        <FigmaFieldCell label="ID">{item.id}</FigmaFieldCell>
                      </div>
                      <div className="sm:col-span-5">
                        <FigmaFieldCell label="Пользователь">
                          {fullName.trim() ? fullName : "—"}
                        </FigmaFieldCell>
                      </div>
                      <div className="sm:col-span-5">
                        <FigmaFieldCell label="Номер телефона">
                          {phone.trim() ? phone : "—"}
                        </FigmaFieldCell>
                      </div>
                      <div className="sm:col-span-6">
                        <FigmaFieldCell label="Telegram User Name">
                          {formatTelegramDisplay(username)}
                        </FigmaFieldCell>
                      </div>
                    </div>
                  </div>

                  <div className="my-6 h-px w-full bg-[#E0E0E0]" aria-hidden />

                  <div>
                    {figmaSectionTitle("Адрес")}
                    <div className="mt-3 rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5">
                      <p className="text-[12px] text-[#888888]">Адрес забора денег</p>
                      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-snug text-black">
                        {item.address?.trim() ? item.address : "—"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    {profileOnly ? figmaSectionTitle("Клиент") : sectionTitle("Клиент")}
                    <div className="mt-3 space-y-3">
                      <FieldRow label="ID" value={String(item.id)} readonly profileOnly={profileOnly} />
                      <FieldRow
                        label="Пользователь"
                        value={fullName}
                        onChange={setFullName}
                        readonly={!editing}
                        placeholder="Имя Фамилия"
                        profileOnly={profileOnly}
                      />
                      <FieldRow
                        label="Номер телефона"
                        value={phone}
                        onChange={setPhone}
                        readonly={!editing}
                        placeholder="+999 99 999 99 99"
                        profileOnly={profileOnly}
                      />
                      <div>
                        <p
                          className={`text-[12px] font-medium ${profileOnly ? "text-[#888888]" : "text-[#8a8a8a]"
                            }`}
                        >
                          Telegram User Name
                        </p>
                        {editing ? (
                          <input
                            className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-[14px] text-black outline-none focus:border-[#b0b0b0] ${profileOnly
                                ? "border-[#E0E0E0] bg-white"
                                : "border-[#e8e8ec] bg-[#f5f5f7] focus:border-[#d0d0d4]"
                              }`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="@name"
                          />
                        ) : (
                          <ReadonlyFieldBox>{formatTelegramDisplay(username)}</ReadonlyFieldBox>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {profileOnly ? figmaSectionTitle("Адрес") : sectionTitle("Адрес")}
                    <p
                      className={`mt-1 text-[12px] font-medium ${profileOnly ? "text-[#888888]" : "text-[#8a8a8a]"
                        }`}
                    >
                      Адрес забора денег
                    </p>
                    {editing ? (
                      <textarea
                        rows={4}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`mt-2 w-full rounded-lg border px-3 py-3 text-[14px] text-black outline-none focus:border-[#b0b0b0] ${profileOnly
                            ? "border-[#E0E0E0] bg-white"
                            : "border-[#e8e8ec] bg-[#f5f5f7] focus:border-[#d0d0d4]"
                          }`}
                        placeholder="Город, улица, дом"
                      />
                    ) : (
                      <ReadonlyFieldBox className="mt-2 whitespace-pre-wrap">
                        {item.address?.trim() ? item.address : "—"}
                      </ReadonlyFieldBox>
                    )}
                  </div>
                </>
              )}

              {!profileOnly ? (
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
              ) : null}
            </div>

            {!profileOnly && recentOrders.length > 0 ? (
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

            <div
              className={`mt-8 flex flex-col gap-3 border-t px-0 pb-1 pt-5 ${profileOnly ? "border-[#E0E0E0]" : "border-[#ececee]"
                }`}
            >
              {editing ? (
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={() => void save()}
                  className={`w-full py-3.5 text-[15px] font-semibold text-white transition disabled:opacity-50 ${profileOnly
                      ? "rounded-lg bg-[#006666] hover:bg-[#005555]"
                      : "rounded-2xl bg-[#006c6b] hover:bg-[#005a59]"
                    }`}
                >
                  {saveLoading ? "Сохранение…" : "Сохранить изменения"}
                </button>
              ) : showCreateOrderActions ? (
                <div
                  className={`flex flex-col gap-3 ${profileOnly ? "items-start sm:flex-row" : "sm:flex-row sm:items-stretch"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => onProceedCreateOrder?.(item)}
                    className={`px-6 py-3 text-[15px] font-semibold text-white transition ${profileOnly
                        ? "rounded-lg bg-[#006666] hover:bg-[#005555]"
                        : "rounded-2xl bg-[#006c6b] px-5 py-3.5 hover:bg-[#005a59] sm:min-w-0 sm:flex-1"
                      }`}
                  >
                    Создать заказ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      syncFromItem(item);
                    }}
                    className={`px-6 py-3 text-[15px] font-semibold transition ${profileOnly
                        ? "rounded-lg bg-[#E9ECEF] text-black hover:bg-[#dde2e6]"
                        : "rounded-2xl border border-[#e8e8ec] bg-[#f0f0f2] px-5 py-3.5 text-[#0a0a0a] hover:bg-[#e4e4e8] sm:min-w-0 sm:flex-1"
                      }`}
                  >
                    Редактировать профиль
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    syncFromItem(item);
                  }}
                  className={`w-full py-3.5 text-[15px] font-semibold text-[#0a0a0a] ${profileOnly
                      ? "rounded-lg bg-[#E9ECEF] hover:bg-[#dde2e6]"
                      : "rounded-2xl border border-[#e8e8ec] bg-[#f5f5f7] hover:bg-[#ececee]"
                    }`}
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
                  className={`w-full py-2 text-[14px] font-medium underline ${profileOnly ? "text-[#006666]" : "text-[#006c6b]"
                    }`}
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

function ReadonlyFieldBox({ children, className }: { children: ReactNode; className?: string }) {
  const hasMargin = className != null && /(^|\s)mt-/.test(className);
  return (
    <div
      className={[
        "rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5 text-[14px] font-medium leading-snug text-black",
        hasMargin ? "" : "mt-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
  readonly,
  placeholder,
  profileOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readonly?: boolean;
  placeholder?: string;
  profileOnly?: boolean;
}) {
  const labelCls = profileOnly ? "text-[12px] font-medium text-[#888888]" : "text-[12px] font-medium text-[#8a8a8a]";
  return (
    <div>
      <p className={labelCls}>{label}</p>
      {readonly ? (
        <ReadonlyFieldBox>{value || "—"}</ReadonlyFieldBox>
      ) : (
        <input
          className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-[14px] text-black outline-none focus:border-[#b0b0b0] ${profileOnly
              ? "border-[#E0E0E0] bg-white"
              : "border-[#e8e8ec] bg-[#f5f5f7] focus:border-[#d0d0d4]"
            }`}
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
