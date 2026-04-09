import type {
  MarketOrderApiItem,
  MarketOrderLineItemApi,
} from "@/types/market-api-orders";
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
  item: MarketOrderApiItem & Record<string, unknown>,
  /** Detail payload often exposes line items here instead of `item.items` */
  productsFromDetail?: MarketOrderLineItemApi[] | null,
  /** Some APIs return admin comment on the detail root instead of `item` */
  rootAdminComment?: string | null,
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

  const explicitRecipientName = pickStr(item, "recipient_name");
  const explicitRecipientPhone = pickStr(item, "recipient_phone");
  const recipientName = explicitRecipientName ?? item.customer_name;
  const recipientPhone = explicitRecipientPhone ?? item.customer_phone;
  const hasSeparateRecipient =
    (explicitRecipientName != null && explicitRecipientName.trim() !== "") ||
    (explicitRecipientPhone != null && explicitRecipientPhone.trim() !== "");

  const ext = item as Record<string, unknown>;
  const pickerName =
    pickStr(item, "picker_name") ??
    pickStr(item, "assembler_name") ??
    "—";
  const pickerIdRaw = ext.picker_id ?? ext.assembler_id;
  const pickerId = pickerIdRaw == null ? "—" : String(pickerIdRaw);

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
  let recipientUserId = pickMarketUserIdFromOrderExtra(ext, [
    "recipient_user_id",
    "recipient_id",
    "receiver_user_id",
    "receiver_id",
  ]);
  if (
    recipientUserId == null &&
    !hasSeparateRecipient &&
    customerUserId != null
  ) {
    recipientUserId = customerUserId;
  }
  const pickerUserId = pickMarketUserIdFromOrderExtra(ext, [
    "picker_id",
    "assembler_id",
  ]);
  const courierUserId = pickMarketUserIdFromOrderExtra(ext, ["courier_id"]);

  const address = pickStr(item, "delivery_address") ?? "—";

  const adminComment =
    pickStr(item, "admin_comment") ??
    (typeof rootAdminComment === "string" ? rootAdminComment : "");

  const itemsTotalUzs = Number.isFinite(item.total_amount_uzs)
    ? Math.round(item.total_amount_uzs).toLocaleString("ru-RU")
    : "—";

  const itemsTotalUsd = Number.isFinite(item.total_amount_usd)
    ? item.total_amount_usd.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

  const rawItems = (
    (Array.isArray(productsFromDetail) && productsFromDetail.length > 0
      ? productsFromDetail
      : null) ?? ext.items ?? ext.line_items
  ) as unknown;
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
      const priceNum = r.price;
      const u =
        r.price_uzs ??
        r.total_uzs ??
        (typeof priceNum === "number" ? priceNum : undefined);
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
        id: String(r.id ?? r.product_id ?? i),
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
    adminComment,
  };
}
