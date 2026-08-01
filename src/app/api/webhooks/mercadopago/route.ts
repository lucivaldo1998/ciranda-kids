import { NextRequest, NextResponse } from "next/server";
import { getGatewayConfig } from "@/lib/payments/config";
import { fetchPayment } from "@/lib/payments/mercadopago";
import { markOrderPaid } from "@/lib/payments";

// Mercado Pago notifica por POST (body {type, data.id}) e/ou query (?topic=payment&id=).
// Nunca confiamos na notificação em si: consultamos o pagamento na API para confirmar.
export async function POST(request: NextRequest) {
  try {
    const url = request.nextUrl;
    let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
    let topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

    const body = await request.json().catch(() => null);
    if (body && typeof body === "object") {
      paymentId = paymentId ?? body?.data?.id;
      topic = topic ?? body?.type;
    }

    if (!paymentId || (topic && !String(topic).includes("payment"))) {
      return NextResponse.json({ ok: true });
    }

    const config = await getGatewayConfig("mercadopago");
    if (!config) return NextResponse.json({ ok: true });

    const payment = await fetchPayment(config, String(paymentId));
    if (payment?.status === "approved" && payment?.external_reference) {
      const orderId = Number(payment.external_reference);
      if (Number.isInteger(orderId)) {
        await markOrderPaid(orderId);
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    // 200 mesmo em erro interno para o MP não desativar o webhook; o status pode ser
    // reconciliado depois pela consulta manual no painel.
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
