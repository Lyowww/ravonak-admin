import type { MoneyTransferOrderItem } from "@/types/money-transfer-orders-api";

export type MoneyTransferUserItem = {
  id: number;
  tg_id: number;
  full_name: string;
  username: string;
  phone_number: string;
  address: string;
  registered_at: string;
  total_orders: number;
  active_orders: number;
  debt_usd: number;
  debt_ils: number;
};

export type MoneyTransferUsersListResponse = {
  items: MoneyTransferUserItem[];
  page: number;
  page_size: number;
  total: number;
};

export type MoneyTransferUserDetailResponse = {
  item: MoneyTransferUserItem;
  recent_orders?: MoneyTransferOrderItem[];
};

export type MoneyTransferUserCreateBody = {
  full_name: string;
  phone_number: string;
  username?: string;
  address?: string;
};

export type MoneyTransferUserPatchBody = {
  full_name?: string;
  phone_number?: string;
  username?: string;
  address?: string;
};
