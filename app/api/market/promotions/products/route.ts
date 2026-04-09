import { resolveBackendPath } from "@/lib/backend-url";

export async function GET(request: Request) {
  const base = resolveBackendPath("/market/promotions/products");
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
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { detail: "Не удалось загрузить акционные товары" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const base = resolveBackendPath("/market/promotions/products");
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
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { detail: "Не удалось добавить товар в акцию" },
      { status: 502 }
    );
  }
}
