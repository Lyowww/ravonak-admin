export type MarketPeriod = "day" | "week" | "month" | "custom";

export type MarketStatisticsResponse = {
  period: string;
  date_from: string;
  date_to: string;
  total_users: number;
  active_users: number;
  total_orders: number;
  total_amount: number;
  avg_order_amount: number;
  total_amount_usd: number;
  avg_order_amount_usd: number;
  total_amount_uzs?: number;
  avg_order_amount_uzs?: number;
  processing_orders?: number;
  assembled_orders?: number;
  delivering_orders?: number;
  completed_orders?: number;
};
