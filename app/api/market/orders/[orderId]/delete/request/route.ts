import { resolveBackendPath } from "@/lib/backend-url";

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const base = resolveBackendPath(`/market/orders/${orderId}/delete/request`);
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const auth = _request.headers.get("authorization");

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ detail: "Не удалось запросить удаление" }, { status: 502 });
  }
}
