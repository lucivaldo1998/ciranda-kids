export type GatewayId = "mercadopago" | "stripe" | "cielo";

export const GATEWAY_IDS: GatewayId[] = ["mercadopago", "stripe", "cielo"];

export const GATEWAY_LABELS: Record<GatewayId, string> = {
  mercadopago: "Mercado Pago",
  stripe: "Stripe",
  cielo: "Cielo",
};

// Configuração resolvida (segredos já decifrados) — só circula no servidor.
export type ResolvedGatewayConfig = {
  id: GatewayId;
  active: boolean;
  testMode: boolean;
  publicKey: string | null; // MP public key / Stripe publishable key / Cielo MerchantId
  secret: string | null; // MP access token / Stripe secret key / Cielo MerchantKey
  webhookSecret: string | null; // Stripe whsec_...
};

// O que o cliente (checkout) pode saber sobre os gateways ativos.
export type PublicGatewayInfo = {
  id: GatewayId;
  testMode: boolean;
};

export type PayableOrder = {
  id: number;
  publicCode: string;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string | null;
  items: { name: string; unitCents: number; qty: number }[];
};

export type PaymentStartResult =
  | { kind: "redirect"; url: string; paymentRef: string }
  | { kind: "pix"; qrCode: string; qrCodeB64: string; paymentRef: string }
  | { kind: "approved"; paymentRef: string }
  | { kind: "failed"; message: string };

export class PaymentError extends Error {}
