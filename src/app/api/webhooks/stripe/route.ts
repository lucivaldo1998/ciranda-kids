import { NextRequest, NextResponse } from "next/server";
import { getGatewayConfig } from "@/lib/payments/config";
import { verifyStripeSignature } from "@/lib/payments/stripe";
import { markOrderPaid } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const config = await getGatewayConfig("stripe");
  if (!config?.webhookSecret) {
    return NextResponse.json({ error: "Webhook do Stripe não configurado." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeSignature(payload, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  try {
    const event = JSON.parse(payload);
    if (event?.type === "checkout.session.completed") {
      const session = event.data?.object;
      const orderId = Number(session?.metadata?.order_id);
      if (Number.isInteger(orderId) && session?.payment_status === "paid") {
        await markOrderPaid(orderId);
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
}
