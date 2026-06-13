import { cn } from "@/lib/utils";
import type { OrderDbStatus } from "@/lib/db/schema";

const STYLES: Record<OrderDbStatus, string> = {
  pending: "bg-secondary text-muted-foreground",
  payment_failed: "bg-destructive/10 text-destructive",
  paid: "bg-brand/10 text-brand",
  processing: "bg-foreground/10 text-foreground",
  shipped: "bg-foreground/10 text-foreground",
  delivered: "bg-brand/10 text-brand",
  cancelled: "bg-destructive/10 text-destructive",
  refund_requested: "bg-destructive/10 text-destructive",
  refunded: "bg-secondary text-muted-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderDbStatus }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? "bg-secondary text-muted-foreground"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
