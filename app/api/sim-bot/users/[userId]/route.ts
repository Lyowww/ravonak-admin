import { resolveBackendPath } from "@/lib/backend-url";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const base = resolveBackendPath(`/sim-bot/users/${userId}`);
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(base, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, {
      status: res.status,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return Response.json({ detail: "Не удалось загрузить пользователя" }, { status: 502 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const base = resolveBackendPath(`/sim-bot/users/${userId}`);
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(base, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, {
      status: res.status,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return Response.json({ detail: "Не удалось обновить пользователя" }, { status: 502 });
  }
}
