"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAuthRequestUrl } from "@/lib/auth-request-url";
import { clearStoredToken, getStoredToken } from "@/lib/auth-storage";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");
  const [message, setMessage] = useState<string | null>(null);

  const verify = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/");
      return;
    }

    const res = await fetch(getAuthRequestUrl("check"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      clearStoredToken();
      setStatus("fail");
      const msg =
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof (data as { detail: unknown }).detail === "string"
          ? (data as { detail: string }).detail
          : "Сессия недействительна";
      setMessage(msg);
      router.replace("/");
      return;
    }

    setStatus("ok");
    setMessage(null);
  }, [router]);

  useEffect(() => {
    void verify();
  }, [verify]);

  function logout() {
    clearStoredToken();
    router.push("/");
    router.refresh();
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-[#f5f5f7] text-[15px] text-zinc-600">
        Проверка сессии…
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-[#f5f5f7] p-8 text-center">
        <p className="text-[15px] text-red-700">{message}</p>
        <Link href="/" className="text-[15px] font-medium text-zinc-900 underline">
          На страницу входа
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#ffffff]">
      <div className="sticky top-0 flex h-screen w-[min(100%,304px)] max-w-[304px] shrink-0 flex-col">
        <Sidebar onLogout={logout} />
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
