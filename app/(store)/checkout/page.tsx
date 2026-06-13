import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function Checkout() {
  const settings = await getStoreSettings();
  return (
    <CheckoutView
      config={{
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShipping: settings.standardShipping,
        expressShipping: settings.expressShipping,
        taxRate: settings.taxRatePct / 100,
      }}
    />
  );
}
