import { getApiAuthUrl } from "@/lib/env";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return Response.json({ detail: "Требуется токен" }, { status: 401 });
  }

  try {
    const target = getApiAuthUrl("check");
    if (!target) {
      return Response.json(
        { detail: "API_URL не задан в окружении" },
        { status: 500 }
      );
    }
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: auth },
    });

    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { detail: "Не удалось проверить сессию" },
      { status: 502 }
    );
  }
}
