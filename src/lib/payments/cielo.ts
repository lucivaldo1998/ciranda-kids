import type { CardData } from "@/lib/validations";
import type { PayableOrder, PaymentStartResult, ResolvedGatewayConfig } from "./types";
import { PaymentError } from "./types";

// Cielo E-commerce API 3.0 — cartão de crédito transparente (o cliente não sai do site).
// publicKey = MerchantId · secret = MerchantKey
const HOSTS = {
  live: { api: "https://api.cieloecommerce.cielo.com.br", query: "https://apiquery.cieloecommerce.cielo.com.br" },
  test: { api: "https://apisandbox.cieloecommerce.cielo.com.br", query: "https://apiquerysandbox.cieloecommerce.cielo.com.br" },
};

function hosts(config: ResolvedGatewayConfig) {
  return config.testMode ? HOSTS.test : HOSTS.live;
}

function headers(config: ResolvedGatewayConfig) {
  if (!config.publicKey || !config.secret) {
    throw new PaymentError("Cielo sem MerchantId/MerchantKey configurados.");
  }
  return {
    "Content-Type": "application/json",
    MerchantId: config.publicKey,
    MerchantKey: config.secret,
  };
}

// Detecção simples de bandeira pelo BIN — cobre as bandeiras aceitas pela Cielo.
export function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Master";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(4011|4312|4389|4514|4573|5041|5066|5090|6277|6362|6363|6504|6505|6516)/.test(n)) return "Elo";
  if (/^(38|60)/.test(n)) return "Hipercard";
  if (/^(30|36|38)/.test(n)) return "Diners";
  return "Visa";
}

// Status Cielo: 1 = autorizado, 2 = pago (capturado), 3/10/13 = negado/cancelado
export async function createCardPayment(
  config: ResolvedGatewayConfig,
  order: PayableOrder,
  card: CardData
): Promise<PaymentStartResult> {
  const body = {
    MerchantOrderId: order.publicCode,
    Customer: {
      Name: order.customerName,
      Email: order.customerEmail,
      ...(order.customerCpf ? { Identity: order.customerCpf, IdentityType: "CPF" } : {}),
    },
    Payment: {
      Type: "CreditCard",
      Amount: order.totalCents,
      Installments: card.installments,
      Capture: true,
      SoftDescriptor: "CIRANDA",
      CreditCard: {
        CardNumber: card.number,
        Holder: card.holder,
        ExpirationDate: `${card.expMonth}/${card.expYear}`,
        SecurityCode: card.cvv,
        Brand: detectBrand(card.number),
      },
    },
  };

  const res = await fetch(`${hosts(config).api}/1/sales`, {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = Array.isArray(data)
      ? data.map((e: { Message?: string }) => e.Message).filter(Boolean).join("; ")
      : `Erro Cielo (${res.status})`;
    throw new PaymentError(message || `Erro Cielo (${res.status})`);
  }

  const payment = data.Payment;
  const status = Number(payment?.Status);
  if (status === 2 || status === 1) {
    return { kind: "approved", paymentRef: String(payment.PaymentId) };
  }
  const reason = payment?.ReturnMessage || "Pagamento não autorizado pela operadora.";
  return { kind: "failed", message: reason };
}

export async function fetchSale(config: ResolvedGatewayConfig, paymentId: string) {
  const res = await fetch(`${hosts(config).query}/1/sales/${paymentId}`, {
    headers: headers(config),
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}
