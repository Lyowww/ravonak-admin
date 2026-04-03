import { resolveBackendPath } from "@/lib/backend-url";

export async function GET(request: Request) {
  const base = resolveBackendPath("/money-transfer/statistics");
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const target = qs ? `${base}?${qs}` : base;
  const auth = request.headers.get("authorization");

  const fetchOpts: RequestInit = {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  };

  try {
    let res = await fetch(target, fetchOpts);
    if (res.status === 404) {
      const altBase = resolveBackendPath("/money_transfer/statistics");
      if (altBase) {
        const altTarget = qs ? `${altBase}?${qs}` : altBase;
        res = await fetch(altTarget, fetchOpts);
      }
    }
    const data = await res.json().catch(() => ({}));
    return Response.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      },
    });
  } catch {
    return Response.json(
      { detail: "Не удалось получить статистику" },
      { status: 502 }
    );
  }
}
