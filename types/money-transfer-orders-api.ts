export type MoneyTransferOrderItem = {
  id: number;
  user_id: number;
  order_code: string;
  client_name: string;
  client_phone: string;
  address: string;
  amount_start_usd: number;
  amount_ils: number;
  amount_usd: number;
  paid_usd: number;
  paid_ils: number;
  delivery_fee_ils: number;
  course_exchange: number;
  exchange_rate: number;
  commission_ils: number;
  commission_usd: number;
  delivery: boolean;
  admin_comment: string;
  is_active: boolean;
  is_collected: boolean;
  is_completed: boolean;
  is_editable: boolean;
  status_label: string;
  created_at: string;
  completed_at: string | null;
};

export type MoneyTransferTransfer = {
  id: number;
  recipient_name: string;
  recipient_phone: string;
  amount_usd: number;
  delivery: boolean;
  status: string;
};

export type MoneyTransferOrdersListResponse = {
  items: MoneyTransferOrderItem[];
  page: number;
  page_size: number;
  total: number;
};

export type MoneyTransferOrderDetailResponse = {
  item: MoneyTransferOrderItem;
  transfers: MoneyTransferTransfer[];
};

export type MoneyTransferOrderPatchBody = {
  admin_comment?: string;
  start_amount?: number;
  amount_ils?: number;
  amount_usd?: number;
  course_exchange?: number;
};

export type MoneyTransferCompleteConfirmBody = {
  approval_token: string;
  admin_comment?: string;
  start_amount?: number;
  amount_ils?: number;
  amount_usd?: number;
  course_exchange?: number;
};

export type MoneyTransferOrderCreateBody = {
  user_id: number;
  address: string;
  amount_start_usd: number;
  amount_ils: number;
  amount_usd: number;
  delivery_fee_ils: number;
  commission_ils: number;
};

export type MoneyTransferApprovalResponse = {
  approval_token: string;
  expires_at: string;
  message: string;
};
