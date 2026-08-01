import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import type { CheckoutData } from "@/lib/validations";

export type CartItemInput = {
  productId: string;
  size: string;
  color: string;
  qty: number;
};

export function newPublicCode(prefix = "") {
  return `${prefix}${randomBytes(9).toString("base64url")}`;
}

export function orderDisplayNumber(id: number) {
  return `#${String(id + 1000)}`;
}

export function computeShipping(subtotalCents: number, settings: { shippingFlatCents: number; freeShippingAboveCents: number }) {
  if (settings.freeShippingAboveCents > 0 && subtotalCents >= settings.freeShippingAboveCents) {
    return 0;
  }
  return settings.shippingFlatCents;
}

// Cria o pedido a partir do carrinho — preços SEMPRE relidos do banco, nunca do cliente.
export async function createOrderFromCart(items: CartItemInput[], data: CheckoutData) {
  if (items.length === 0) throw new Error("Carrinho vazio.");
  const settings = await getSettings();

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const orderItems = items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new Error("Um dos produtos do carrinho não está mais disponível.");
    const qty = Math.max(1, Math.min(10, Math.floor(item.qty)));
    return {
      productId: product.id,
      name: product.name,
      size: item.size,
      color: item.color,
      unitCents: product.priceCents,
      qty,
      imageUrl: product.images[0]?.url ?? null,
    };
  });

  const subtotalCents = orderItems.reduce((sum, i) => sum + i.unitCents * i.qty, 0);
  const shippingCents = computeShipping(subtotalCents, settings);

  return prisma.order.create({
    data: {
      publicCode: newPublicCode(),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerCpf: data.customerCpf || null,
      shipCep: data.shipCep,
      shipStreet: data.shipStreet,
      shipNumber: data.shipNumber,
      shipComplement: data.shipComplement || null,
      shipDistrict: data.shipDistrict,
      shipCity: data.shipCity,
      shipState: data.shipState.toUpperCase(),
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      items: { create: orderItems },
    },
    include: { items: true },
  });
}

// Cria o pedido de pagamento de uma encomenda sob medida aprovada pelo cliente.
export async function createOrderForCustomOrder(customOrderId: string, data: CheckoutData) {
  const customOrder = await prisma.customOrder.findUnique({ where: { id: customOrderId } });
  if (!customOrder) throw new Error("Encomenda não encontrada.");
  if (!customOrder.quoteCents) throw new Error("Esta encomenda ainda não tem orçamento definido.");
  if (customOrder.status !== "orcamento_enviado") {
    throw new Error("Esta encomenda não está aguardando aprovação.");
  }
  const existing = await prisma.order.findUnique({ where: { customOrderId } });
  if (existing) return existing;

  return prisma.order.create({
    data: {
      publicCode: newPublicCode(),
      customOrderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerCpf: data.customerCpf || null,
      shipCep: data.shipCep,
      shipStreet: data.shipStreet,
      shipNumber: data.shipNumber,
      shipComplement: data.shipComplement || null,
      shipDistrict: data.shipDistrict,
      shipCity: data.shipCity,
      shipState: data.shipState.toUpperCase(),
      subtotalCents: customOrder.quoteCents,
      shippingCents: 0, // frete incluído no orçamento do Ateliê
      totalCents: customOrder.quoteCents,
      items: {
        create: [
          {
            name: `Peça sob medida · ${customOrder.code}`,
            unitCents: customOrder.quoteCents,
            qty: 1,
            imageUrl: customOrder.aiImageUrl ?? customOrder.referenceImageUrl,
          },
        ],
      },
    },
    include: { items: true },
  });
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_preparo: "Em preparo",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const CUSTOM_ORDER_STATUS_LABELS: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  orcamento_enviado: "Orçamento enviado",
  aprovada: "Aprovada (paga)",
  em_producao: "Em produção",
  finalizada: "Finalizada",
  entregue: "Entregue",
  cancelada: "Cancelada",
};
