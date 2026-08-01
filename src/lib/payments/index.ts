import { prisma } from "@/lib/prisma";
import type { CardData } from "@/lib/validations";
import type { GatewayId, PayableOrder, PaymentStartResult } from "./types";
import { PaymentError } from "./types";
import { getGatewayConfig } from "./config";
import * as mercadopago from "./mercadopago";
import * as stripe from "./stripe";
import * as cielo from "./cielo";

export type PaymentMethodChoice =
  | { provider: "mercadopago"; method: "pix" }
  | { provider: "mercadopago"; method: "redirect" }
  | { provider: "stripe"; method: "redirect" }
  | { provider: "cielo"; method: "card"; card: CardData };

// Orquestra o início do pagamento de um pedido e persiste o resultado no Order.
export async function startPayment(
  orderId: number,
  choice: PaymentMethodChoice
): Promise<PaymentStartResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new PaymentError("Pedido não encontrado.");
  if (order.status !== "aguardando_pagamento") {
    throw new PaymentError("Este pedido não está aguardando pagamento.");
  }

  const config = await getGatewayConfig(choice.provider);
  if (!config?.active) throw new PaymentError("Forma de pagamento indisponível no momento.");

  const payable: PayableOrder = {
    id: order.id,
    publicCode: order.publicCode,
    totalCents: order.totalCents,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerCpf: order.customerCpf,
    items: [
      ...order.items.map((i) => ({ name: i.name, unitCents: i.unitCents, qty: i.qty })),
      ...(order.shippingCents > 0 ? [{ name: "Frete", unitCents: order.shippingCents, qty: 1 }] : []),
    ],
  };

  let result: PaymentStartResult;
  if (choice.provider === "mercadopago" && choice.method === "pix") {
    result = await mercadopago.createPixPayment(config, payable);
  } else if (choice.provider === "mercadopago") {
    result = await mercadopago.createCheckoutPreference(config, payable);
  } else if (choice.provider === "stripe") {
    result = await stripe.createCheckoutSession(config, payable);
  } else if (choice.provider === "cielo" && choice.method === "card") {
    result = await cielo.createCardPayment(config, payable, choice.card);
  } else {
    throw new PaymentError("Forma de pagamento inválida.");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentProvider: choice.provider,
      paymentMethod: choice.method,
      paymentRef: "paymentRef" in result ? result.paymentRef : null,
      pixQrCode: result.kind === "pix" ? result.qrCode : null,
      pixQrCodeB64: result.kind === "pix" ? result.qrCodeB64 : null,
      checkoutUrl: result.kind === "redirect" ? result.url : null,
    },
  });

  if (result.kind === "approved") {
    await markOrderPaid(order.id);
  }

  return result;
}

// Marca como pago (idempotente) e baixa o estoque das variantes compradas.
export async function markOrderPaid(orderId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "aguardando_pagamento") return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "pago" } });
    for (const item of order.items) {
      if (!item.productId || !item.size) continue;
      const variant = await tx.productVariant.findFirst({
        where: { productId: item.productId, size: item.size, color: item.color },
      });
      if (variant && variant.stock > 0) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: Math.max(0, variant.stock - item.qty) },
        });
      }
    }
    if (order.customOrderId) {
      await tx.customOrder.update({
        where: { id: order.customOrderId },
        data: { status: "aprovada" },
      });
    }
  });
}
