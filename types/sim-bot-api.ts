export type SimBotPeriod = "day" | "week" | "month" | "custom";

export type SimBotStatisticsResponse = {
  total_users: number;
  new_numbers: number;
  earnings_ils: string | number;
  deactivated_sim: number;
};

export type SimBotTariffItem = {
  id: number;
  name_tarif: string;
  coast_tarif: string;
  tarif: string;
};

export type SimBotTariffsResponse = {
  items: SimBotTariffItem[];
};

export type SimBotUserListItem = {
  id: number;
  name: string;
  username: string;
  tg_id: number;
  phone: string;
  tariff_ils: string;
  tariff_name: string;
  balance_amount: string;
  number_active: boolean;
  number_phone_id: number;
  created_at: string;
};

export type SimBotUsersListResponse = {
  items: SimBotUserListItem[];
  total: number;
};

export type SimBotUserDetailItem = {
  id: number;
  name: string;
  username: string;
  tg_id: number;
  phone: string;
  tariff_id: number;
  tariff_ils: string;
  tariff_name: string;
  balance_amount: string;
  debt_display: string;
  number_active: boolean;
  number_phone_id: number;
  address: string;
  created_at: string;
};

export type SimBotUserDetailResponse = {
  item: SimBotUserDetailItem;
};

export type SimBotUserCreateBody = {
  name: string;
  phone: string;
  tariff_id: number;
  debt: number;
  address: string;
  username: string;
};

export type SimBotUserCreateResponse = {
  id: number;
};

export type SimBotUserPatchBody = {
  name?: string;
  username?: string;
  address?: string;
  phone?: string;
  tariff_id?: number;
};

export type SimBotOkDetailResponse = {
  ok: boolean;
  detail?: string;
};

export type SimBotBalanceHistoryItem = {
  id: number;
  user_id: number;
  delta: string;
  balance_after: string;
  note: string;
  created_at: string;
};

export type SimBotBalanceHistoryResponse = {
  items: SimBotBalanceHistoryItem[];
};

export type SimBotBalanceAdjustBody = {
  delta: number;
  note: string;
};
