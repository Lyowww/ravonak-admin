import type { MarketOrderApiItem } from "@/types/market-api-orders";
import type { OrderDetail } from "@/types/market-order";

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
}

function pickStr(o: Record<string, unknown>, k: string): string | undefined {
  const v = o[k];
  return typeof v === "string" ? v : undefined;
}

/** First positive integer among known API keys (market user id). */
export function pickMarketUserIdFromOrderExtra(
  ext: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const k of keys) {
    const v = ext[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      const t = Math.trunc(v);
      if (t > 0) return t;
    }
    if (typeof v === "string") {
      const s = v.trim();
      if (/^\d+$/.test(s)) {
        const n = parseInt(s, 10);
        if (n > 0) return n;
      }
    }
  }
  return null;
}

export function mapApiItemToOrderDetail(
  item: MarketOrderApiItem & Record<string, unknown>
): OrderDetail {
  const statusVariant =
    item.status === "completed"
      ? "completed"
      : item.status === "processing"
        ? "processing"
        : "other";

  const createdAtLabel = new Date(item.created_at).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const recipientName = pickStr(item, "recipient_name") ?? item.customer_name;
  const recipientPhone =
    pickStr(item, "recipient_phone") ?? item.customer_phone;

  const ext = item as Record<string, unknown>;
  const pickerName = pickStr(item, "picker_name") ?? "—";
  const pickerId =
    ext.picker_id == null ? "—" : String(ext.picker_id);

  const courierName = pickStr(item, "courier_name") ?? "—";
  const courierId =
    ext.courier_id == null ? "—" : String(ext.courier_id);

  const customerUserId = pickMarketUserIdFromOrderExtra(ext, [
    "customer_id",
    "user_id",
    "buyer_id",
    "client_id",
    "customer_user_id",
  ]);
  const recipientUserId = pickMarketUserIdFromOrderExtra(ext, [
    "recipient_user_id",
    "recipient_id",
    "receiver_user_id",
    "receiver_id",
  ]);
  const pickerUserId = pickMarketUserIdFromOrderExtra(ext, ["picker_id"]);
  const courierUserId = pickMarketUserIdFromOrderExtra(ext, ["courier_id"]);

  const address = pickStr(item, "delivery_address") ?? "—";

  const itemsTotalUzs = Number.isFinite(item.total_amount_uzs)
    ? Math.round(item.total_amount_uzs).toLocaleString("ru-RU")
    : "—";

  const itemsTotalUsd = Number.isFinite(item.total_amount_usd)
    ? item.total_amount_usd.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

  const rawItems = (ext.items ?? ext.line_items) as unknown;
  let items: OrderDetail["items"];

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    items = rawItems.map((row, i) => {
      const r = row as Record<string, unknown>;
      const title =
        (typeof r.product_name === "string" ? r.product_name : null) ??
        (typeof r.name === "string" ? r.name : null) ??
        (typeof r.title === "string" ? r.title : null) ??
        "Товар";
      const qty = r.quantity;
      const qtyLabel =
        typeof qty === "number"
          ? `x${qty}`
          : typeof qty === "string"
            ? qty
            : "";
      const u = r.price_uzs ?? r.total_uzs;
      const us = r.price_usd ?? r.total_usd;
      const priceUzs =
        typeof u === "number" ? Math.round(u).toLocaleString("ru-RU") : "—";
      const priceUsd =
        typeof us === "number"
          ? us.toLocaleString("ru-RU", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "—";
      return {
        id: String(r.id ?? i),
        title,
        qtyLabel,
        priceUzs,
        priceUsd,
      };
    });
  } else {
    items = [
      {
        id: "sum",
        title: "Сумма по заказу",
        qtyLabel: "",
        priceUzs: itemsTotalUzs,
        priceUsd: itemsTotalUsd,
      },
    ];
  }

  return {
    id: String(item.order_id),
    number: item.order_number,
    statusLabel: item.status_label,
    statusVariant,
    createdAtLabel,
    customerUserId,
    recipientUserId,
    pickerUserId,
    courierUserId,
    customer: {
      name: item.customer_name,
      phone: formatPhoneDisplay(item.customer_phone),
    },
    recipient: {
      name: recipientName,
      phone: formatPhoneDisplay(recipientPhone),
    },
    picker: { name: pickerName, id: pickerId },
    courier: { name: courierName, id: courierId },
    address,
    itemsTotalUzs,
    itemsTotalUsd,
    items,
  };
}
