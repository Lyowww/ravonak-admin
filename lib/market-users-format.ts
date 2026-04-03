export function formatUserDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatUserDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBalanceUsd(n: number): string {
  return `${n.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })} $`;
}

export function formatTelegramDisplay(username: string): string {
  const u = username.trim();
  if (!u) return "—";
  return u.startsWith("@") ? u : `@${u}`;
}

export function operationTitleRu(operation: string): string {
  const o = operation.toLowerCase();
  if (o === "topup") return "Пополнение";
  if (o === "withdraw") return "Списание";
  return operation;
}

export function isWithdrawOperation(operation: string): boolean {
  return operation.toLowerCase() === "withdraw";
}
