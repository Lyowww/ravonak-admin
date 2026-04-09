/** GET /api/market/promotions/products, GET/PATCH single, POST add */
export type MarketPromotionProductItem = {
  product_id: number;
  product_name: string;
  image_url: string;
  price_uzs: number;
  price_usd: number;
  discount_percentage: number;
  discounted_price_uzs: number;
  discounted_price_usd: number;
};

export type MarketPromotionsProductsListResponse = {
  items: MarketPromotionProductItem[];
  total: number;
  usd_rate: number;
  usd_rate_date: string;
};

export type MarketPromotionProductSingleResponse = {
  item: MarketPromotionProductItem;
  usd_rate: number;
  usd_rate_date: string;
};

export type MarketPromotionProductAddBody = {
  product_id: number;
  discount_percentage: number;
};

export type MarketPromotionProductPatchBody = {
  discount_percentage: number;
};

/** GET /api/market/promotions/candidates */
export type MarketPromotionCandidateItem = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  shelf_life: string;
  unit: string;
  is_active: boolean;
  price_uzs: number;
  price_usd: number;
  stock_quantity: number;
  chapter_id: number;
  chapter_name: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  regos_item_id: number;
};

export type MarketPromotionsCandidatesListResponse = {
  items: MarketPromotionCandidateItem[];
  total: number;
  usd_rate: number;
  usd_rate_date: string;
};

/** POST .../remove/request */
export type MarketPromotionRemoveRequestResponse = {
  approval_token: string;
  expires_at: string;
  message: string;
};

/** POST .../remove/confirm */
export type MarketPromotionRemoveConfirmResponse = {
  success: boolean;
  message: string;
};

export type MarketPromotionRemoveConfirmBody = {
  approval_token: string;
};
