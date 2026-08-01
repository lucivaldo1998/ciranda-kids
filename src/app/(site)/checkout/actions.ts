"use server";

import { checkoutSchema, cardSchema, type CardData } from "@/lib/validations";
import { createOrderFromCart, createOrderForCustomOrder, type CartItemInput } from "@/lib/orders";
import { startPayment, type PaymentMethodChoice } from "@/lib/payments";
import { PaymentError } from "@/lib/payments/types";

export type PlaceOrderInput = {
  items: CartItemInput[];
  customOrderId?: string;
  data: Record<string, string>;
  payment: { provider: "mercadopago" | "stripe" | "cielo"; method: "pix" | "redirect" | "card" };
  card?: Record<string, string>;
};

export type PlaceOrderResult =
  | { ok: false; message: string }
  | {
      ok: true;
      orderCode: string;
      outcome:
        | { kind: "redirect"; url: string }
        | { kind: "pix" }
        | { kind: "approved" }
        | { kind: "failed"; message: string };
    };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const parsed = checkoutSchema.safeParse(input.data);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { ok: false, message: first?.message ?? "Dados inválidos." };
    }

    let card: CardData | undefined;
    if (input.payment.provider === "cielo") {
      const parsedCard = cardSchema.safeParse(input.card ?? {});
      if (!parsedCard.success) {
        const first = parsedCard.error.issues[0];
        return { ok: false, message: first?.message ?? "Dados do cartão inválidos." };
      }
      card = parsedCard.data;
    }

    const order = input.customOrderId
      ? await createOrderForCustomOrder(input.customOrderId, parsed.data)
      : await createOrderFromCart(input.items, parsed.data);

    let choice: PaymentMethodChoice;
    if (input.payment.provider === "cielo") {
      choice = { provider: "cielo", method: "card", card: card! };
    } else if (input.payment.provider === "mercadopago" && input.payment.method === "pix") {
      choice = { provider: "mercadopago", method: "pix" };
    } else if (input.payment.provider === "mercadopago") {
      choice = { provider: "mercadopago", method: "redirect" };
    } else {
      choice = { provider: "stripe", method: "redirect" };
    }

    const result = await startPayment(order.id, choice);
    const outcome =
      result.kind === "redirect"
        ? ({ kind: "redirect", url: result.url } as const)
        : result.kind === "pix"
          ? ({ kind: "pix" } as const)
          : result.kind === "approved"
            ? ({ kind: "approved" } as const)
            : ({ kind: "failed", message: result.message } as const);

    return { ok: true, orderCode: order.publicCode, outcome };
  } catch (error) {
    const message =
      error instanceof PaymentError || error instanceof Error
        ? error.message
        : "Não foi possível concluir o pedido.";
    return { ok: false, message };
  }
}
