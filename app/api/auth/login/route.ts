import { getApiAuthUrl } from "@/lib/env";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  try {
    const target = getApiAuthUrl("login");
    if (!target) {
      return Response.json(
        { detail: "API_URL не задан в окружении" },
        { status: 500 }
      );
    }
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { detail: "Не удалось связаться с сервером авторизации" },
      { status: 502 }
    );
  }
}
