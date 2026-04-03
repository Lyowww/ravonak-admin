export type MarketUserItem = {
  id: number;
  tg_id: number;
  full_name: string;
  phone_number: string;
  telegram_username: string;
  registered_at: string;
  balance_usd: number;
};

export type MarketUsersListResponse = {
  items: MarketUserItem[];
  page: number;
  page_size: number;
  total: number;
};

export type MarketUserDetailResponse = {
  item: MarketUserItem;
};

export type BalanceHistoryItem = {
  id: string;
  operation: string;
  source: string;
  title: string;
  amount_usd: number;
  created_at: string;
  balance_after_usd: number;
};

export type BalanceHistoryResponse = {
  items: BalanceHistoryItem[];
  total: number;
};

export type BalanceMutationBody = {
  amount_usd: number;
  comment: string;
};

export type BalanceMutationResponse = {
  success: boolean;
  message: string;
  new_balance_usd: number;
  history_item: BalanceHistoryItem;
};
