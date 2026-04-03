import { resolveBackendPath } from "@/lib/backend-url";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const base = resolveBackendPath(`/money-transfer/orders/${orderId}/complete/request`);
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(base, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ detail: "Не удалось запросить завершение" }, { status: 502 });
  }
}
