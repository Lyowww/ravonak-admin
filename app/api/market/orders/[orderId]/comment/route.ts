import { resolveBackendPath } from "@/lib/backend-url";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const base = resolveBackendPath(`/market/orders/${orderId}/comment`);
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  const body = await request.text();

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: body || "{}",
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ detail: "Не удалось сохранить комментарий" }, { status: 502 });
  }
}
