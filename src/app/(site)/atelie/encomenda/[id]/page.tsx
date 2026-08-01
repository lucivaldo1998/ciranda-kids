import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { CUSTOM_ORDER_STATUS_LABELS } from "@/lib/orders";
import { MEASUREMENT_FIELDS, parseMeasurements } from "@/lib/measurements";
import { fabricLabel } from "@/lib/fabrics";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Minha encomenda" };

const TIMELINE = ["nova", "em_analise", "orcamento_enviado", "aprovada", "em_producao", "finalizada", "entregue"];

export default async function EncomendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customOrder, settings] = await Promise.all([
    prisma.customOrder.findUnique({
      where: { id },
      include: { baseProduct: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } }, order: true },
    }),
    getSettings(),
  ]);
  if (!customOrder) notFound();

  const measurements = parseMeasurements(customOrder.measurementsJson);
  const currentIndex = TIMELINE.indexOf(customOrder.status);
  const canceled = customOrder.status === "cancelada";
  const awaitingApproval = customOrder.status === "orcamento_enviado" && customOrder.quoteCents;
  const referenceImage =
    customOrder.aiImageUrl ??
    customOrder.referenceImageUrl ??
    customOrder.baseProduct?.images[0]?.url ??
    null;

  return (
    <Container className="max-w-4xl py-14">
      <p className="mb-2 text-center text-xs uppercase tracking-[0.3em] text-accent">
        Ateliê sob medida
      </p>
      <h1 className="text-center font-display text-4xl font-medium">
        Encomenda {customOrder.code}
      </h1>
      <p className="mt-2 text-center text-sm text-ink/60">
        Status:{" "}
        <strong className="text-ink">
          {CUSTOM_ORDER_STATUS_LABELS[customOrder.status] ?? customOrder.status}
        </strong>
      </p>

      {/* Linha do tempo */}
      {!canceled ? (
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-y-3">
          {TIMELINE.map((status, i) => (
            <div key={status} className="flex items-center">
              <div className="flex flex-col items-center">
                {i <= currentIndex ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5 text-ink/25" aria-hidden />
                )}
                <span
                  className={`mt-1 max-w-16 text-center text-[10px] leading-tight ${
                    i <= currentIndex ? "text-ink/80" : "text-ink/40"
                  }`}
                >
                  {CUSTOM_ORDER_STATUS_LABELS[status]}
                </span>
              </div>
              {i < TIMELINE.length - 1 ? (
                <div className={`mx-1 h-px w-5 sm:w-8 ${i < currentIndex ? "bg-primary" : "bg-ink/20"}`} />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Orçamento para aprovar */}
      {awaitingApproval ? (
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-accent/40 bg-accent/5 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Orçamento pronto</p>
          <p className="mt-3 font-display text-4xl">{formatBRL(customOrder.quoteCents!)}</p>
          {customOrder.quoteNotes ? (
            <p className="mt-3 text-sm text-ink/70">{customOrder.quoteNotes}</p>
          ) : null}
          <div className="mt-6">
            <ButtonLink href={`/checkout/encomenda/${customOrder.id}`} variant="accent" size="lg">
              Aprovar e pagar
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-ink/55">
            Alguma dúvida antes de aprovar?{" "}
            <a
              className="text-accent hover:underline"
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                `Olá! Sobre a encomenda ${customOrder.code}…`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale com o ateliê
            </a>
          </p>
        </div>
      ) : null}

      {customOrder.order && customOrder.order.status === "aguardando_pagamento" ? (
        <div className="mt-6 text-center">
          <ButtonLink href={`/pedido/${customOrder.order.publicCode}`} variant="outline">
            Concluir pagamento do orçamento
          </ButtonLink>
        </div>
      ) : null}

      {/* Detalhes */}
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-ink/15 bg-white/50 p-6">
          <h2 className="font-display text-xl">A peça</h2>
          {referenceImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={referenceImage}
              alt="Referência da peça"
              className="mt-4 max-h-80 w-full object-contain"
            />
          ) : null}
          <dl className="mt-4 space-y-2 text-sm">
            {customOrder.baseProduct ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Modelo base</dt>
                <dd>{customOrder.baseProduct.name}</dd>
              </div>
            ) : null}
            {customOrder.fabric ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Tecido</dt>
                <dd>{fabricLabel(customOrder.fabric)}</dd>
              </div>
            ) : null}
            {customOrder.colorNotes ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Cores</dt>
                <dd className="text-right">{customOrder.colorNotes}</dd>
              </div>
            ) : null}
          </dl>
          {customOrder.aiPrompt ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/70">
              <span className="text-ink/50">Descrição: </span>
              {customOrder.aiPrompt}
            </p>
          ) : null}
          {customOrder.details ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/70">
              <span className="text-ink/50">Observações: </span>
              {customOrder.details}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-ink/15 bg-white/50 p-6">
          <h2 className="font-display text-xl">Suas medidas</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {MEASUREMENT_FIELDS.map((field) => (
              <div key={field.key} className="flex justify-between gap-4">
                <dt className="text-ink/55">{field.label}</dt>
                <dd>{measurements[field.key] ? `${measurements[field.key]} cm` : "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-ink/10 pt-4 text-xs text-ink/50">
            Alguma medida mudou? Avise o ateliê pelo WhatsApp antes da produção começar.
          </p>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-ink/60">
        <Link href="/atelie" className="hover:underline">
          ← Voltar ao Ateliê
        </Link>
      </p>
    </Container>
  );
}
