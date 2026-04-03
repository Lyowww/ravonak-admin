import { resolveBackendPath } from "@/lib/backend-url";

export async function GET(request: Request) {
  const base = resolveBackendPath("/sim-bot/statistics");
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const target = qs ? `${base}?${qs}` : base;
  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(target, {
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
    return Response.json({ detail: "Не удалось загрузить статистику" }, { status: 502 });
  }
}
