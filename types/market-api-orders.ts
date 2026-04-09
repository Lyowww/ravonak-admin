export type MarketOrderStatus =
  | "processing"
  | "assembled"
  | "delivering"
  | "completed";

/** GET /api/market/orders item */
export type MarketOrderApiItem = {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: MarketOrderStatus;
  status_label: string;
  created_at: string;
  total_amount: number;
  total_amount_usd: number;
  total_amount_uzs: number;
};

export type MarketOrdersListResponse = {
  items: MarketOrderApiItem[];
  page: number;
  page_size: number;
  total: number;
};

export type MarketOrderDetailResponse = {
  item: MarketOrderApiItem & MarketOrderDetailExtra;
  /** Line items when returned separately from `item` */
  products?: MarketOrderLineItemApi[];
  admin_comment?: string | null;
};

/** Optional fields that detail may include beyond the list schema */
export type MarketOrderDetailExtra = {
  customer_id?: string | number | null;
  user_id?: string | number | null;
  buyer_id?: string | number | null;
  recipient_user_id?: string | number | null;
  recipient_id?: string | number | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  delivery_address?: string | null;
  picker_name?: string | null;
  picker_id?: string | number | null;
  assembler_name?: string | null;
  assembler_id?: string | number | null;
  courier_name?: string | null;
  courier_id?: string | number | null;
  admin_comment?: string | null;
  line_items?: MarketOrderLineItemApi[];
  items?: MarketOrderLineItemApi[];
};

export type MarketOrderLineItemApi = {
  id?: number | string;
  product_id?: number | string;
  product_name?: string;
  name?: string;
  title?: string;
  quantity?: number | string;
  unit?: string;
  weight_grams?: number | null;
  /** UZS (some APIs send `price` instead of `price_uzs`) */
  price?: number;
  price_uzs?: number;
  price_usd?: number;
  total_uzs?: number;
  total_usd?: number;
  image_url?: string | null;
};

export type DeleteRequestResponse = {
  approval_token: string;
  expires_at: string;
  message: string;
};

export type DeleteConfirmResponse = {
  success: boolean;
  message: string;
};
