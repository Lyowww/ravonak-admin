import { resolveBackendPath } from "@/lib/backend-url";

export async function POST(request: Request) {
  const base = resolveBackendPath("/market/banners/upload");
  if (!base) {
    return Response.json({ detail: "API_URL не задан в окружении" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ detail: "Invalid form data" }, { status: 400 });
  }

  const auth = request.headers.get("authorization");

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ detail: "Не удалось загрузить файл" }, { status: 502 });
  }
}
