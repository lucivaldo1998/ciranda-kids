import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listActiveGateways } from "@/lib/payments/config";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pagar encomenda" };

export default async function CustomOrderCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customOrder, settings, gateways] = await Promise.all([
    prisma.customOrder.findUnique({ where: { id }, include: { order: true } }),
    getSettings(),
    listActiveGateways(),
  ]);
  if (!customOrder || !customOrder.quoteCents) notFound();

  // Se o pedido de pagamento já existe, leva direto para ele.
  if (customOrder.order) {
    redirect(`/pedido/${customOrder.order.publicCode}`);
  }
  if (customOrder.status !== "orcamento_enviado") {
    redirect(`/atelie/encomenda/${customOrder.id}`);
  }

  return (
    <CheckoutClient
      gateways={gateways}
      shippingFlatCents={settings.shippingFlatCents}
      freeShippingAboveCents={settings.freeShippingAboveCents}
      shippingNote="Frete e prazo de produção incluídos no orçamento do Ateliê."
      fixedItem={{
        customOrderId: customOrder.id,
        label: `Peça sob medida · ${customOrder.code}`,
        totalCents: customOrder.quoteCents,
      }}
    />
  );
}
