import { getSettings } from "@/lib/settings";
import { listActiveGateways } from "@/lib/payments/config";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [settings, gateways] = await Promise.all([getSettings(), listActiveGateways()]);

  return (
    <CheckoutClient
      gateways={gateways}
      shippingFlatCents={settings.shippingFlatCents}
      freeShippingAboveCents={settings.freeShippingAboveCents}
      shippingNote={settings.shippingNote}
    />
  );
}
