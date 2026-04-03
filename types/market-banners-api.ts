export type MarketBannerItem = {
  id: number;
  image_url: string;
  title: string;
  description: string;
  link_url: string;
  is_active: boolean;
  order: number;
};

export type MarketBannersListResponse = {
  items: MarketBannerItem[];
};

export type MarketBannerWriteBody = {
  image_url: string;
  title: string;
  description: string;
  link_url: string;
  order: number;
  is_active: boolean;
};

export type MarketBannerSingleResponse = {
  item: MarketBannerItem;
};

export type MarketBannerUploadResponse = {
  image_url: string;
  filename: string;
};

export type MarketBannerDeleteRequestResponse = {
  approval_token: string;
  expires_at: string;
  message: string;
};

export type MarketBannerDeleteConfirmBody = {
  approval_token: string;
};

export type MarketBannerDeleteConfirmResponse = {
  success: boolean;
  message: string;
};
