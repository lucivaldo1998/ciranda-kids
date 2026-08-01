import { createHmac, timingSafeEqual } from "node:crypto";
import type { PayableOrder, PaymentStartResult, ResolvedGatewayConfig } from "./types";
import { PaymentError } from "./types";
import { getSiteUrl } from "./config";

const API = "https://api.stripe.com";

// Sem SDK: a API do Stripe aceita application/x-www-form-urlencoded puro.
function encodeForm(params: Record<string, string>) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export async function createCheckoutSession(
  config: ResolvedGatewayConfig,
  order: PayableOrder
): Promise<PaymentStartResult> {
  if (!config.secret) throw new PaymentError("Stripe sem secret key configurada.");
  const siteUrl = getSiteUrl();
  const orderUrl = `${siteUrl}/pedido/${order.publicCode}`;

  const params: Record<string, string> = {
    mode: "payment",
    success_url: orderUrl,
    cancel_url: `${orderUrl}?falha=1`,
    customer_email: order.customerEmail,
    "metadata[order_id]": String(order.id),
    "payment_intent_data[metadata][order_id]": String(order.id),
  };
  order.items.forEach((item, i) => {
    params[`line_items[${i}][quantity]`] = String(item.qty);
    params[`line_items[${i}][price_data][currency]`] = "brl";
    params[`line_items[${i}][price_data][unit_amount]`] = String(item.unitCents);
    params[`line_items[${i}][price_data][product_data][name]`] = item.name;
  });

  const res = await fetch(`${API}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm(params),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof body?.error?.message === "string" ? body.error.message : `Erro Stripe (${res.status})`;
    throw new PaymentError(message);
  }
  if (!body?.url) throw new PaymentError("Stripe não retornou a URL de checkout.");
  return { kind: "redirect", url: body.url, paymentRef: String(body.id) };
}

// Verifica a assinatura "Stripe-Signature: t=...,v1=..." com o signing secret (whsec_...).
export function verifyStripeSignature(payload: string, sigHeader: string | null, secret: string) {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=", 2) as [string, string])
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;
  // tolerância de 5 minutos contra replay
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
