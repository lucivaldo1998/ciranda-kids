import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGatewayConfig } from "@/lib/payments/config";
import { fetchSale } from "@/lib/payments/cielo";
import { markOrderPaid } from "@/lib/payments";

// URL de notificação configurável no portal da Cielo. A venda transparente já é
// confirmada de forma síncrona no checkout; este webhook cobre mudanças posteriores.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const paymentId = body?.PaymentId ?? body?.paymentId;
    if (!paymentId) return NextResponse.json({ ok: true });

    const config = await getGatewayConfig("cielo");
    if (!config) return NextResponse.json({ ok: true });

    const sale = await fetchSale(config, String(paymentId));
    const status = Number(sale?.Payment?.Status);
    if (status === 2) {
      const order = await prisma.order.findFirst({ where: { paymentRef: String(paymentId) } });
      if (order) await markOrderPaid(order.id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
