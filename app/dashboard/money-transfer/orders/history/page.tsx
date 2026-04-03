import { MoneyTransferOrdersWorkspace } from "@/components/dashboard/money-transfer-orders-workspace";

export const dynamic = "force-dynamic";

export default function MoneyTransferOrdersHistoryPage() {
  return <MoneyTransferOrdersWorkspace variant="history" />;
}
