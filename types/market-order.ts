export type OrderDetail = {
  id: string;
  number: string;
  statusLabel: string;
  statusVariant: "processing" | "completed" | "other";
  createdAtLabel: string;
  /** Market user id when API exposes it (opens user popup) */
  customerUserId: number | null;
  recipientUserId: number | null;
  pickerUserId: number | null;
  courierUserId: number | null;
  customer: { name: string; phone: string };
  recipient: { name: string; phone: string };
  picker: { name: string; id: string };
  courier: { name: string; id: string };
  address: string;
  itemsTotalUzs: string;
  itemsTotalUsd: string;
  items: Array<{
    id: string;
    title: string;
    qtyLabel: string;
    priceUzs: string;
    priceUsd: string;
  }>;
};
