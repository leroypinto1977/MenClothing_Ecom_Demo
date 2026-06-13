import type { AddressSnapshot } from "@/lib/db/schema";

export interface EmailOrderLine {
  name: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface EmailOrder {
  number: string;
  email: string;
  customerName?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: AddressSnapshot | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: EmailOrderLine[];
  /** Present on the refund email. */
  refundAmount?: number;
  refundReason?: string;
}

/** Absolute storefront base URL for links/buttons in emails. */
export function siteUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}
