import { randomUUID } from "node:crypto";
import type { PayableOrder, PaymentStartResult, ResolvedGatewayConfig } from "./types";
import { PaymentError } from "./types";
import { getSiteUrl } from "./config";

const API = "https://api.mercadopago.com";

async function mpFetch(config: ResolvedGatewayConfig, path: string, init?: RequestInit) {
  if (!config.secret) throw new PaymentError("Mercado Pago sem access token configurado.");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.secret}`,
      "Content-Type": "application/json",
      ...(init?.method === "POST" ? { "X-Idempotency-Key": randomUUID() } : {}),
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body?.message === "string" ? body.message : `Erro Mercado Pago (${res.status})`;
    throw new PaymentError(message);
  }
  return body;
}

// PIX direto no site: cria pagamento e devolve QR Code (copia-e-cola + imagem base64).
export async function createPixPayment(
  config: ResolvedGatewayConfig,
  order: PayableOrder
): Promise<PaymentStartResult> {
  const siteUrl = getSiteUrl();
  const [firstName, ...rest] = order.customerName.split(" ");
  const body: Record<string, unknown> = {
    transaction_amount: Number((order.totalCents / 100).toFixed(2)),
    payment_method_id: "pix",
    description: `Pedido ${order.publicCode}`,
    external_reference: String(order.id),
    notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    payer: {
      email: order.customerEmail,
      first_name: firstName,
      last_name: rest.join(" ") || firstName,
      ...(order.customerCpf
        ? { identification: { type: "CPF", number: order.customerCpf } }
        : {}),
    },
  };
  const payment = await mpFetch(config, "/v1/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const tx = payment?.point_of_interaction?.transaction_data;
  if (!tx?.qr_code) throw new PaymentError("Mercado Pago não retornou o QR Code do PIX.");
  return {
    kind: "pix",
    qrCode: tx.qr_code,
    qrCodeB64: tx.qr_code_base64 ?? "",
    paymentRef: String(payment.id),
  };
}

// Cartão (e outros meios) via Checkout Pro: redireciona para o Mercado Pago.
export async function createCheckoutPreference(
  config: ResolvedGatewayConfig,
  order: PayableOrder
): Promise<PaymentStartResult> {
  const siteUrl = getSiteUrl();
  const orderUrl = `${siteUrl}/pedido/${order.publicCode}`;
  const body = {
    items: order.items.map((item) => ({
      title: item.name,
      quantity: item.qty,
      currency_id: "BRL",
      unit_price: Number((item.unitCents / 100).toFixed(2)),
    })),
    payer: { name: order.customerName, email: order.customerEmail },
    external_reference: String(order.id),
    notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    back_urls: { success: orderUrl, pending: orderUrl, failure: `${orderUrl}?falha=1` },
    auto_return: "approved",
    statement_descriptor: "CIRANDA",
  };
  const pref = await mpFetch(config, "/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!pref?.init_point) throw new PaymentError("Mercado Pago não retornou a URL de checkout.");
  return { kind: "redirect", url: pref.init_point, paymentRef: String(pref.id) };
}

// Webhook: consulta o pagamento para confirmar o status real.
export async function fetchPayment(config: ResolvedGatewayConfig, paymentId: string) {
  return mpFetch(config, `/v1/payments/${paymentId}`);
}
