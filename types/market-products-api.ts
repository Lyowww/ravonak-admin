export type MarketSubcategoryNode = {
  id: number;
  name: string;
};

export type MarketCategoryNode = {
  id: number;
  name: string;
  subcategories: MarketSubcategoryNode[];
};

export type MarketChapterNode = {
  id: number;
  name: string;
  categories: MarketCategoryNode[];
};

export type MarketProductItem = {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  shelf_life: string;
  unit: string;
  is_active: boolean;
  price_uzs: number;
  price_usd: number;
  /** Акция: если заданы и ниже базовой цены — UI показывает зачёркнутую и красную цену */
  promo_price_uzs?: number | null;
  promo_price_usd?: number | null;
  is_promo?: boolean | null;
  stock_quantity: number;
  chapter_id: number;
  chapter_name: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  regos_item_id: number;
};

export type MarketProductsListResponse = {
  items: MarketProductItem[];
  page: number;
  page_size: number;
  total: number;
  usd_rate: number;
  usd_rate_date: string;
};

export type MarketProductDetailResponse = {
  item: MarketProductItem;
  usd_rate: number;
  usd_rate_date: string;
};

export type MarketProductWriteResponse = {
  item: MarketProductItem;
  usd_rate: number;
  usd_rate_date: string;
};

export type MarketProductCreateBody = {
  name: string;
  description: string;
  image_url: string;
  shelf_life: string;
  unit: string;
  price_uzs: number;
  subcategory_id: number;
  is_active: boolean;
};

export type MarketProductPatchBody = Partial<MarketProductCreateBody>;
