import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABELS, orderDisplayNumber } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { OrderStatusPoller } from "@/components/checkout/OrderStatusPoller";
import { CopyPixButton } from "@/components/checkout/CopyPixButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seu pedido" };

const STATUS_ICONS: Record<string, typeof Clock> = {
  aguardando_pagamento: Clock,
  pago: CheckCircle2,
  em_preparo: Package,
  enviado: Truck,
  entregue: CheckCircle2,
  cancelado: XCircle,
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ falha?: string }>;
}) {
  const { code } = await params;
  const { falha } = await searchParams;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { publicCode: code },
      include: { items: true, customOrder: true },
    }),
    getSettings(),
  ]);
  if (!order) notFound();

  const awaiting = order.status === "aguardando_pagamento";
  const StatusIcon = STATUS_ICONS[order.status] ?? Clock;

  return (
    <Container className="max-w-3xl py-14">
      <OrderStatusPoller active={awaiting} />

      <div className="text-center">
        <StatusIcon
          className={`mx-auto h-12 w-12 ${
            order.status === "cancelado"
              ? "text-red-600"
              : awaiting
                ? "text-accent"
                : "text-primary"
          }`}
          aria-hidden
        />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ink/50">
          Pedido {orderDisplayNumber(order.id)}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium">
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </h1>
        {falha && awaiting ? (
          <p className="mx-auto mt-3 max-w-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            O pagamento não foi concluído. Você pode tentar novamente abaixo.
          </p>
        ) : null}
        {awaiting ? (
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/65">
            Assim que o pagamento for confirmado, esta página atualiza sozinha e você também
            receberá a confirmação pelo WhatsApp.
          </p>
        ) : null}
      </div>

      {/* PIX */}
      {awaiting && order.pixQrCode ? (
        <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-ink/15 bg-white/60 p-6 text-center">
          <p className="font-display text-xl">Pague com PIX</p>
          <p className="mt-1 text-sm text-ink/60">
            Escaneie o QR Code no app do seu banco ou copie o código.
          </p>
          {order.pixQrCodeB64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${order.pixQrCodeB64}`}
              alt="QR Code PIX"
              className="mx-auto mt-4 h-52 w-52"
            />
          ) : null}
          <p className="mt-4 max-h-20 overflow-hidden break-all border border-ink/10 bg-canvas p-2 text-[10px] text-ink/60">
            {order.pixQrCode}
          </p>
          <div className="mt-3">
            <CopyPixButton code={order.pixQrCode} />
          </div>
        </div>
      ) : null}

      {/* Pagamento por redirecionamento pendente */}
      {awaiting && order.checkoutUrl ? (
        <div className="mt-8 text-center">
          <ButtonLink href={order.checkoutUrl} size="lg">
            Continuar pagamento
          </ButtonLink>
        </div>
      ) : null}

      {/* Itens */}
      <div className="mt-12 rounded-2xl border border-ink/15 bg-white/50 p-6">
        <h2 className="font-display text-xl">Resumo</h2>
        <div className="mt-4 space-y-3 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4">
              <span className="text-ink/75">
                {item.qty}× {item.name}
                {item.size ? <span className="text-ink/45"> ({item.size})</span> : null}
              </span>
              <span>{formatBRL(item.unitCents * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="my-4 h-px bg-ink/10" />
        <div className="space-y-1.5 text-sm text-ink/75">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>{order.shippingCents === 0 ? "Grátis" : formatBRL(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium text-ink">
            <span>Total</span>
            <span>{formatBRL(order.totalCents)}</span>
          </div>
        </div>
        <div className="mt-6 border-t border-ink/10 pt-4 text-sm text-ink/65">
          <p className="font-medium text-ink/80">Entrega</p>
          <p>
            {order.shipStreet}, {order.shipNumber}
            {order.shipComplement ? ` — ${order.shipComplement}` : ""}
          </p>
          <p>
            {order.shipDistrict} · {order.shipCity}/{order.shipState} · CEP {order.shipCep}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-ink/60">
        <p>
          Dúvidas sobre seu pedido?{" "}
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
              `Olá! Sobre o pedido ${orderDisplayNumber(order.id)}…`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Chame no WhatsApp
          </a>
        </p>
        <p className="mt-2">
          <Link href="/loja" className="hover:underline">
            ← Voltar para a loja
          </Link>
        </p>
      </div>
    </Container>
  );
}
