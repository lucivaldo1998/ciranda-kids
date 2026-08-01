import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { formatBRL, parseBRLToCents } from "@/lib/money";
import { CUSTOM_ORDER_STATUS_LABELS } from "@/lib/orders";
import { MEASUREMENT_FIELDS, parseMeasurements } from "@/lib/measurements";
import { fabricLabel } from "@/lib/fabrics";
import { getSiteUrl } from "@/lib/payments/config";
import { PageHeader, Card, StatusBadge, AdminField, adminInput, SubmitButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  modelo: "Modelo da coleção",
  referencia: "Foto de referência",
  ia: "Croqui por IA",
};

async function sendQuoteAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const quoteCents = parseBRLToCents(String(formData.get("quote") ?? ""));
  if (!quoteCents) return;
  await prisma.customOrder.update({
    where: { id },
    data: {
      quoteCents,
      quoteNotes: String(formData.get("quoteNotes") ?? "").trim() || null,
      status: "orcamento_enviado",
    },
  });
  revalidatePath(`/admin/atelie/${id}`);
}

async function updateCustomStatusAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!Object.keys(CUSTOM_ORDER_STATUS_LABELS).includes(status)) return;
  await prisma.customOrder.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/atelie/${id}`);
  revalidatePath("/admin/atelie");
}

async function saveNotesAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  await prisma.customOrder.update({
    where: { id },
    data: { adminNotes: String(formData.get("adminNotes") ?? "").trim() || null },
  });
  revalidatePath(`/admin/atelie/${id}`);
}

export default async function AtelieDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customOrder = await prisma.customOrder.findUnique({
    where: { id },
    include: {
      baseProduct: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      order: true,
    },
  });
  if (!customOrder) notFound();

  const measurements = parseMeasurements(customOrder.measurementsJson);
  const referenceImage =
    customOrder.aiImageUrl ??
    customOrder.referenceImageUrl ??
    customOrder.baseProduct?.images[0]?.url ??
    null;
  const publicUrl = `${getSiteUrl()}/atelie/encomenda/${customOrder.id}`;
  const whatsappDigits = customOrder.customerPhone.replace(/\D/g, "");
  const whatsappNumber = whatsappDigits.startsWith("55") ? whatsappDigits : `55${whatsappDigits}`;

  return (
    <>
      <PageHeader
        title={`Encomenda ${customOrder.code}`}
        subtitle={`${TYPE_LABELS[customOrder.type] ?? customOrder.type} · recebida em ${customOrder.createdAt.toLocaleString("pt-BR")}`}
        action={
          <StatusBadge
            status={customOrder.status}
            label={CUSTOM_ORDER_STATUS_LABELS[customOrder.status] ?? customOrder.status}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-semibold">A peça pedida</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {referenceImage ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referenceImage}
                    alt="Referência"
                    className="max-h-96 w-full rounded border border-slate-200 object-contain"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    {customOrder.aiImageUrl
                      ? "Croqui gerado por IA"
                      : customOrder.referenceImageUrl
                        ? "Foto enviada pelo cliente"
                        : "Foto do modelo base"}
                  </p>
                </div>
              ) : null}
              <div className="space-y-3 text-sm">
                {customOrder.baseProduct ? (
                  <p>
                    <span className="text-slate-500">Modelo base: </span>
                    <Link href={`/admin/produtos/${customOrder.baseProduct.id}`} className="font-medium underline">
                      {customOrder.baseProduct.name}
                    </Link>{" "}
                    ({formatBRL(customOrder.baseProduct.priceCents)})
                  </p>
                ) : null}
                {customOrder.fabric ? (
                  <p>
                    <span className="text-slate-500">Tecido: </span>
                    {fabricLabel(customOrder.fabric)}
                  </p>
                ) : (
                  <p className="text-slate-500">Tecido: cliente quer sugestão do ateliê</p>
                )}
                {customOrder.colorNotes ? (
                  <p>
                    <span className="text-slate-500">Cores/estampas: </span>
                    {customOrder.colorNotes}
                  </p>
                ) : null}
                {customOrder.aiPrompt ? (
                  <p>
                    <span className="text-slate-500">Descrição do cliente: </span>
                    {customOrder.aiPrompt}
                  </p>
                ) : null}
                {customOrder.details ? (
                  <p>
                    <span className="text-slate-500">Observações: </span>
                    {customOrder.details}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold">Ficha de medidas</h2>
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {MEASUREMENT_FIELDS.map((field) => (
                <div key={field.key} className="flex justify-between border-b border-slate-100 py-1.5 text-sm">
                  <span className="text-slate-500">{field.label}</span>
                  <span className="font-medium">
                    {measurements[field.key] ? `${measurements[field.key]} cm` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Anotações internas</h2>
            <form action={saveNotesAction}>
              <input type="hidden" name="id" value={customOrder.id} />
              <textarea
                name="adminNotes"
                defaultValue={customOrder.adminNotes ?? ""}
                placeholder="Metragem de tecido, fornecedor, prazo estimado…"
                className={`${adminInput} min-h-24`}
              />
              <div className="mt-3 text-right">
                <SubmitButton>Salvar anotações</SubmitButton>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-semibold">Orçamento</h2>
            {customOrder.quoteCents ? (
              <p className="mb-3 text-2xl font-bold">{formatBRL(customOrder.quoteCents)}</p>
            ) : null}
            <form action={sendQuoteAction} className="space-y-3">
              <input type="hidden" name="id" value={customOrder.id} />
              <AdminField label="Valor (R$)">
                <input
                  name="quote"
                  defaultValue={
                    customOrder.quoteCents
                      ? (customOrder.quoteCents / 100).toFixed(2).replace(".", ",")
                      : ""
                  }
                  placeholder="1.450,00"
                  className={adminInput}
                />
              </AdminField>
              <AdminField label="Condições (prazo, entrega…)">
                <textarea
                  name="quoteNotes"
                  defaultValue={customOrder.quoteNotes ?? ""}
                  placeholder="Ex.: 30 dias de produção + envio incluso"
                  className={`${adminInput} min-h-20`}
                />
              </AdminField>
              <SubmitButton className="w-full">
                {customOrder.quoteCents ? "Atualizar orçamento" : "Enviar orçamento"}
              </SubmitButton>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              Ao enviar, o cliente vê o valor na página da encomenda e pode aprovar e pagar online.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Status</h2>
            <form action={updateCustomStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={customOrder.id} />
              <select name="status" defaultValue={customOrder.status} className={adminInput}>
                {Object.entries(CUSTOM_ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <SubmitButton>Aplicar</SubmitButton>
            </form>
            {customOrder.order ? (
              <p className="mt-3 text-sm text-slate-600">
                Pagamento:{" "}
                <Link href={`/admin/pedidos/${customOrder.order.id}`} className="underline">
                  ver pedido vinculado
                </Link>
              </p>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Cliente</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{customOrder.customerName}</p>
              <p>{customOrder.customerEmail}</p>
              <p>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Olá, ${customOrder.customerName.split(" ")[0]}! Sobre sua encomenda ${customOrder.code} no ateliê: `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline"
                >
                  {customOrder.customerPhone} (WhatsApp)
                </a>
              </p>
              {customOrder.customerCity ? <p>{customOrder.customerCity}</p> : null}
            </div>
            <p className="mt-4 break-all rounded bg-slate-50 p-2 text-xs text-slate-500">
              Página do cliente: {publicUrl}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
