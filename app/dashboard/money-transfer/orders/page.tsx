import { MoneyTransferOrdersWorkspace } from "@/components/dashboard/money-transfer-orders-workspace";

export const dynamic = "force-dynamic";

export default function MoneyTransferOrdersPage() {
  return <MoneyTransferOrdersWorkspace variant="current" />;
}
