"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthRequestUrl } from "@/lib/auth-request-url";
import { setStoredToken } from "@/lib/auth-storage";

type FieldErrors = {
  username: string | null;
  password: string | null;
  general: string | null;
};

/** Maps API message text to username row, password row, or general. */
function mapMessageToFieldErrors(message: string): FieldErrors {
  const empty: FieldErrors = { username: null, password: null, general: null };
  const lowered = message.toLowerCase();
  if (lowered.includes("логин") || lowered.includes("username")) {
    return { ...empty, username: message };
  }
  if (lowered.includes("парол") || lowered.includes("password")) {
    return { ...empty, password: message };
  }
  return { ...empty, general: message };
}

function parseApiErrors(data: unknown): FieldErrors {
  const empty: FieldErrors = { username: null, password: null, general: null };

  if (typeof data !== "object" || data === null) {
    return { ...empty, general: "Не удалось выполнить вход" };
  }

  const rec = data as Record<string, unknown>;

  /* 200 + { success: false, message: "…" } */
  if (rec.success === false) {
    const msg =
      typeof rec.message === "string" && rec.message.trim()
        ? rec.message
        : "Не удалось выполнить вход";
    return mapMessageToFieldErrors(msg);
  }

  const detail = rec.detail;

  if (Array.isArray(detail)) {
    const next = { ...empty };
    for (const item of detail) {
      if (typeof item !== "object" || item === null) continue;
      const row = item as { msg?: unknown; loc?: unknown };
      const msg = typeof row.msg === "string" ? row.msg : "Некорректное значение";
      const loc = Array.isArray(row.loc) ? row.loc : [];

      if (loc.includes("username")) {
        next.username = msg;
      } else if (loc.includes("password")) {
        next.password = msg;
      } else {
        next.general = msg;
      }
    }
    if (next.username || next.password || next.general) {
      return next;
    }
  }

  if (typeof detail === "string") {
    return mapMessageToFieldErrors(detail);
  }

  if (typeof rec.message === "string") {
    return mapMessageToFieldErrors(rec.message);
  }

  return { ...empty, general: "Не удалось выполнить вход" };
}

function hasFieldError(errors: FieldErrors): boolean {
  return Boolean(errors.username || errors.password);
}

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({
    username: null,
    password: null,
    general: null,
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({ username: null, password: null, general: null });
    setLoading(true);

    try {
      const res = await fetch(getAuthRequestUrl("login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(parseApiErrors(data));
        return;
      }

      const payload = data as { success?: boolean; token?: string | null };

      if (payload.success === false) {
        setErrors(parseApiErrors(data));
        return;
      }

      if (!payload.token) {
        setErrors(parseApiErrors(data));
        return;
      }

      setStoredToken(payload.token);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({
        username: null,
        password: null,
        general: "Сетевая ошибка. Проверьте подключение.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-[36px] bg-white p-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-8 text-center">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#0a0a0a]">
          Admin Ravonak
        </h1>
        <p className="mt-2 text-[15px] font-normal leading-snug text-[#5c5c5c]">
          Пройдите авторизацию
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="username" className="text-[13px] font-normal text-[#8a8a8a]">
              Логин
            </label>
            {errors.username ? (
              <span className="text-[13px] font-normal text-[#d44a5c]">{errors.username}</span>
            ) : null}
          </div>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`box-border w-full rounded-[14px] border bg-white px-4 py-[14px] text-[15px] outline-none transition placeholder:text-[#b0b0b0] ${
              errors.username
                ? "border-[#d44a5c] text-[#d44a5c] focus:border-[#d44a5c]"
                : "border-[#e4e4e4] text-[#0a0a0a] focus:border-[#c8c8c8]"
            }`}
            placeholder=""
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-[13px] font-normal text-[#8a8a8a]">
              Пароль
            </label>
            {errors.password ? (
              <span className="text-[13px] font-normal text-[#d44a5c]">{errors.password}</span>
            ) : null}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`box-border w-full rounded-[14px] border bg-white px-4 py-[14px] text-[15px] outline-none transition placeholder:text-[#b0b0b0] ${
              errors.password
                ? "border-[#d44a5c] text-[#d44a5c] focus:border-[#d44a5c]"
                : "border-[#e4e4e4] text-[#0a0a0a] focus:border-[#c8c8c8]"
            }`}
            placeholder=""
            required
          />
        </div>

        {errors.general && !hasFieldError(errors) ? (
          <p className="text-center text-[13px] leading-snug text-[#d44a5c]" role="alert">
            {errors.general}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-[14px] bg-[#2A2A2E] py-[14px] text-[15px] font-medium text-white transition hover:bg-[#1f1f22] disabled:cursor-not-allowed enabled:cursor-pointer disabled:opacity-60"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
