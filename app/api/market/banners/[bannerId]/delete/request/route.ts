import { resolveBackendPath } from "@/lib/backend-url";

export async function POST(
  request: Request,
  context: { params: Promise<{ bannerId: string }> }
) {
  const { bannerId } = await context.params;
  const base = resolveBackendPath(`/market/banners/${bannerId}/delete/request`);
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");

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
