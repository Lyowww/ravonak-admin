import { getApiAuthUrl } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const target = getApiAuthUrl("check");
    if (!target) {
      return Response.json(
        { detail: "API_URL не задан в окружении" },
        { status: 500 }
      );
    }
    const auth = request.headers.get("authorization");
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
      { detail: "Не удалось проверить сессию" },
      { status: 502 }
    );
  }
}
