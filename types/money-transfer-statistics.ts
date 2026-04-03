export type MoneyTransferPeriod = "day" | "week" | "month" | "custom";

export type MoneyTransferStatisticsResponse = {
  period: string;
  date_from: string;
  date_to: string;
  reserve_samarkand_usd: number;
  all_orders_count: number;
  all_orders_ils: number;
  all_orders_usd: number;
  collected_orders_count: number;
  collected_orders_ils: number;
  collected_orders_usd: number;
  not_collected_orders_count: number;
  not_collected_orders_ils: number;
  not_collected_orders_usd: number;
  clients_debt_ils: number;
  clients_debt_usd: number;
};
