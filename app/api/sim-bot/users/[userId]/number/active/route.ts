import { resolveBackendPath } from "@/lib/backend-url";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const basePath = resolveBackendPath(`/sim-bot/users/${userId}/number/active`);
  if (!basePath) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const target = qs ? `${basePath}?${qs}` : basePath;
  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(target, {
      method: "POST",
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
    return Response.json({ detail: "Не удалось обновить статус номера" }, { status: 502 });
  }
}
