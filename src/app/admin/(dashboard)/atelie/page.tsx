import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { CUSTOM_ORDER_STATUS_LABELS } from "@/lib/orders";
import { cn } from "@/lib/cn";
import { PageHeader, Card, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  modelo: "Modelo da coleção",
  referencia: "Foto de referência",
  ia: "Croqui por IA",
};

const FILTERS = ["todas", "nova", "em_analise", "orcamento_enviado", "aprovada", "em_producao", "finalizada", "entregue", "cancelada"];

export default async function AtelieAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && FILTERS.includes(status) ? status : "todas";

  const customOrders = await prisma.customOrder.findMany({
    where: filter === "todas" ? {} : { status: filter },
    include: { baseProduct: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Ateliê sob medida"
        subtitle="Fila de encomendas personalizadas para a Cleide avaliar, orçar e produzir."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "todas" ? "/admin/atelie" : `/admin/atelie?status=${f}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-500"
            )}
          >
            {f === "todas" ? "Todas" : CUSTOM_ORDER_STATUS_LABELS[f]}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Encomenda</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Orçamento</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {customOrders.map((customOrder) => (
              <tr key={customOrder.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/atelie/${customOrder.id}`} className="font-medium hover:underline">
                    {customOrder.code}
                  </Link>
                </td>
                <td className="px-4 py-3">{customOrder.customerName}</td>
                <td className="px-4 py-3 text-slate-500">
                  {TYPE_LABELS[customOrder.type] ?? customOrder.type}
                  {customOrder.baseProduct ? ` · ${customOrder.baseProduct.name}` : ""}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {customOrder.createdAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  {customOrder.quoteCents ? formatBRL(customOrder.quoteCents) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={customOrder.status}
                    label={CUSTOM_ORDER_STATUS_LABELS[customOrder.status] ?? customOrder.status}
                  />
                </td>
              </tr>
            ))}
            {customOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma encomenda nesta situação.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
