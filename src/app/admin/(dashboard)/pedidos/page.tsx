import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABELS, orderDisplayNumber } from "@/lib/orders";
import { GATEWAY_LABELS, type GatewayId } from "@/lib/payments/types";
import { cn } from "@/lib/cn";
import { PageHeader, Card, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const FILTERS = ["todos", "aguardando_pagamento", "pago", "em_preparo", "enviado", "entregue", "cancelado"];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && FILTERS.includes(status) ? status : "todos";

  const orders = await prisma.order.findMany({
    where: filter === "todos" ? {} : { status: filter },
    include: { customOrder: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Pedidos" subtitle="Vendas da loja e pagamentos de encomendas." />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "todos" ? "/admin/pedidos" : `/admin/pedidos?status=${f}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-500"
            )}
          >
            {f === "todos" ? "Todos" : ORDER_STATUS_LABELS[f]}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${order.id}`} className="font-medium hover:underline">
                    {orderDisplayNumber(order.id)}
                    {order.customOrder ? (
                      <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-800">
                        sob medida
                      </span>
                    ) : null}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 text-slate-500">
                  {order.createdAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {order.paymentProvider
                    ? `${GATEWAY_LABELS[order.paymentProvider as GatewayId] ?? order.paymentProvider}${
                        order.paymentMethod === "pix" ? " · PIX" : ""
                      }`
                    : "—"}
                </td>
                <td className="px-4 py-3">{formatBRL(order.totalCents)}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={order.status}
                    label={ORDER_STATUS_LABELS[order.status] ?? order.status}
                  />
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhum pedido aqui ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
