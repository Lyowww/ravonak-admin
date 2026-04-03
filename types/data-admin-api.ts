export type DebitCreditCategoryItem = {
  category: string;
  label: string;
};

export type DebitCreditCategoriesResponse = {
  items: unknown[];
};

export type DebitCreditTransactionHistoryItem = {
  id: number;
  category: string;
  label_ru: string;
  entry_date: string;
  amount_usd: string;
  created_at: string;
};

export type DebitCreditRateHistoryItem = {
  id: number;
  entry_date: string;
  rate: string;
  created_at: string;
};

export type DebitCreditHistoryResponse = {
  transactions: DebitCreditTransactionHistoryItem[];
  purchase_rates: DebitCreditRateHistoryItem[];
};

export type DebitCreditPostTransactionBody = {
  entry_kind: "transaction";
  summary?: string;
  value: {
    category: string;
    amount: string;
    date: string;
  };
};

export type DebitCreditPostPurchaseRateBody = {
  entry_kind: "purchase_rate";
  summary?: string;
  value: {
    rate: string;
    date: string;
  };
};

export type DebitCreditPostResponse = {
  ok: boolean;
  id: number;
};

export type SamarkandReserveCurrentResponse = {
  amount_usd: number;
  updated_at: string;
};

export type SamarkandReserveHistoryItem = {
  id: number;
  amount_usd: number;
  created_at: string;
};

export type SamarkandReserveHistoryResponse = {
  items: SamarkandReserveHistoryItem[];
};

export type SamarkandReservePostBody = {
  amount_usd: number;
};

export type SamarkandReservePostResponse = {
  ok: boolean;
  id: number;
};

export type CommissionRuleItem = {
  id: number;
  min_usd: string;
  max_usd: string;
  value: string;
  value_type: "fixed" | "percent";
  range_label: string;
};

export type CommissionRulesListResponse = {
  items: CommissionRuleItem[];
  total: number;
  page: number;
  page_size: number;
};

export type CommissionRulePatchBody = {
  value: number;
  value_type: "fixed" | "percent";
};

export type CommissionRulePatchResponse = {
  item: CommissionRuleItem;
};
