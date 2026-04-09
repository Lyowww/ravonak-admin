"use client";

import { toast } from "sonner";

/** Copies text and shows a top-right toast (Sonner `Toaster` in root layout). */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  } catch {
    toast.error("Не удалось скопировать");
  }
}
