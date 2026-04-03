import { resolveBackendPath } from "@/lib/backend-url";

export async function GET(request: Request) {
  const base = resolveBackendPath("/market/categories/tree");
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(base, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ detail: "Не удалось загрузить категории" }, { status: 502 });
  }
}
