import { clearStoredToken, getStoredToken } from "@/lib/auth-storage";
import { resolvePublicApiRequestUrl } from "@/lib/public-api-url";

function extractDetail(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const d = (data as { detail?: unknown }).detail;
  if (typeof d === "string") return d;
  if (
    Array.isArray(d) &&
    d[0] &&
    typeof d[0] === "object" &&
    d[0] !== null &&
    "msg" in d[0]
  ) {
    return String((d[0] as { msg: unknown }).msg);
  }
  if (typeof (data as { message?: unknown }).message === "string") {
    return (data as { message: string }).message;
  }
  return null;
}

export type AuthenticatedResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; unauthorized?: boolean };

export async function authenticatedFetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<AuthenticatedResult<T>> {
  const token = getStoredToken();
  if (!token) {
    return { ok: false, status: 401, message: "Не авторизован", unauthorized: true };
  }

  const url = resolvePublicApiRequestUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Нет соединения с сервером. Проверьте сеть и что приложение запущено.",
    };
  }

  const data: unknown = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    clearStoredToken();
    return {
      ok: false,
      status: res.status,
      message: extractDetail(data) ?? "Сессия недействительна",
      unauthorized: true,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: extractDetail(data) ?? `Ошибка ${res.status}`,
    };
  }

  return { ok: true, data: data as T };
}

/** POST multipart (e.g. file upload); response parsed as JSON. */
export async function authenticatedFetchFormData<T>(
  path: string,
  formData: FormData
): Promise<AuthenticatedResult<T>> {
  const token = getStoredToken();
  if (!token) {
    return { ok: false, status: 401, message: "Не авторизован", unauthorized: true };
  }

  const url = resolvePublicApiRequestUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Нет соединения с сервером. Проверьте сеть и что приложение запущено.",
    };
  }

  const data: unknown = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    clearStoredToken();
    return {
      ok: false,
      status: res.status,
      message: extractDetail(data) ?? "Сессия недействительна",
      unauthorized: true,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: extractDetail(data) ?? `Ошибка ${res.status}`,
    };
  }

  return { ok: true, data: data as T };
}
