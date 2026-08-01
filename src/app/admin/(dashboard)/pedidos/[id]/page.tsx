import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABELS, orderDisplayNumber } from "@/lib/orders";
import { markOrderPaid } from "@/lib/payments";
import { GATEWAY_LABELS, type GatewayId } from "@/lib/payments/types";
import { PageHeader, Card, StatusBadge, adminInput, SubmitButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function updateStatusAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Object.keys(ORDER_STATUS_LABELS).includes(status)) return;

  if (status === "pago") {
    // marca como pago via fluxo oficial (baixa estoque e atualiza encomenda vinculada)
    await markOrderPaid(id);
  } else {
    await prisma.order.update({ where: { id }, data: { status } });
  }
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
}

export default async function PedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true, customOrder: true },
  });
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={`Pedido ${orderDisplayNumber(order.id)}`}
        subtitle={`Criado em ${order.createdAt.toLocaleString("pt-BR")}`}
        action={
          <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status] ?? order.status} />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Itens</h2>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <span className="block h-14 w-11 shrink-0 overflow-hidden rounded bg-slate-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {item.size ? `Tam. ${item.size}` : ""}
                    {item.color ? ` · ${item.color}` : ""}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {item.qty}× {formatBRL(item.unitCents)}
                </p>
                <p className="w-24 text-right text-sm font-medium">
                  {formatBRL(item.qty * item.unitCents)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatBRL(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Frete</span>
              <span>{formatBRL(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span>{formatBRL(order.totalCents)}</span>
            </div>
          </div>

          {order.customOrder ? (
            <p className="mt-4 rounded bg-purple-50 p-3 text-sm text-purple-900">
              Este pedido paga a encomenda sob medida{" "}
              <Link href={`/admin/atelie/${order.customOrder.id}`} className="font-medium underline">
                {order.customOrder.code}
              </Link>
              .
            </p>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-semibold">Status</h2>
            <form action={updateStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className={adminInput}>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <SubmitButton>Aplicar</SubmitButton>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              Marcar como “Pago” baixa o estoque automaticamente.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Cliente</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>
                <a
                  href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline"
                >
                  {order.customerPhone} (WhatsApp)
                </a>
              </p>
              {order.customerCpf ? <p>CPF: {order.customerCpf}</p> : null}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Entrega</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                {order.shipStreet}, {order.shipNumber}
                {order.shipComplement ? ` — ${order.shipComplement}` : ""}
              </p>
              <p>
                {order.shipDistrict} · {order.shipCity}/{order.shipState}
              </p>
              <p>CEP {order.shipCep}</p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Pagamento</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                Provedor:{" "}
                {order.paymentProvider
                  ? GATEWAY_LABELS[order.paymentProvider as GatewayId] ?? order.paymentProvider
                  : "—"}
              </p>
              <p>Método: {order.paymentMethod ?? "—"}</p>
              <p className="break-all">Ref.: {order.paymentRef ?? "—"}</p>
              <p>
                Página do cliente:{" "}
                <Link href={`/pedido/${order.publicCode}`} target="_blank" className="underline">
                  abrir
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
