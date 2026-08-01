import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABELS, CUSTOM_ORDER_STATUS_LABELS, orderDisplayNumber } from "@/lib/orders";
import { PageHeader, Card, StatCard, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [paidLast30, awaitingCount, newCustomOrders, recentOrders, recentCustom, lowStock] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { notIn: ["aguardando_pagamento", "cancelado"] }, createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalCents: true },
        _count: true,
      }),
      prisma.order.count({ where: { status: "aguardando_pagamento" } }),
      prisma.customOrder.count({ where: { status: { in: ["nova", "em_analise"] } } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.customOrder.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.productVariant.count({ where: { stock: { lte: 1 } } }),
    ]);

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="O pulso da loja e do ateliê nos últimos 30 dias."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Vendas (30 dias)"
          value={formatBRL(paidLast30._sum.totalCents ?? 0)}
          hint={`${paidLast30._count} pedidos confirmados`}
        />
        <StatCard label="Aguardando pagamento" value={String(awaitingCount)} />
        <StatCard
          label="Encomendas para avaliar"
          value={String(newCustomOrders)}
          hint="Novas ou em análise"
        />
        <StatCard
          label="Variações com estoque baixo"
          value={String(lowStock)}
          hint="1 peça ou menos"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm text-slate-500 hover:text-slate-900">
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Nenhum pedido ainda.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {orderDisplayNumber(order.id)} · {order.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.createdAt.toLocaleDateString("pt-BR")} · {formatBRL(order.totalCents)}
                    </p>
                  </div>
                  <StatusBadge
                    status={order.status}
                    label={ORDER_STATUS_LABELS[order.status] ?? order.status}
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Ateliê sob medida</h2>
            <Link href="/admin/atelie" className="text-sm text-slate-500 hover:text-slate-900">
              Ver todas →
            </Link>
          </div>
          {recentCustom.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Nenhuma encomenda ainda.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCustom.map((customOrder) => (
                <Link
                  key={customOrder.id}
                  href={`/admin/atelie/${customOrder.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {customOrder.code} · {customOrder.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {customOrder.createdAt.toLocaleDateString("pt-BR")}
                      {customOrder.quoteCents ? ` · ${formatBRL(customOrder.quoteCents)}` : ""}
                    </p>
                  </div>
                  <StatusBadge
                    status={customOrder.status}
                    label={CUSTOM_ORDER_STATUS_LABELS[customOrder.status] ?? customOrder.status}
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
