"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, QrCode, Globe, Lock } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/cn";
import { placeOrder, type PlaceOrderInput } from "@/app/(site)/checkout/actions";

type GatewayInfo = { id: "mercadopago" | "stripe" | "cielo"; testMode: boolean };

type PaymentOption = {
  key: string;
  provider: GatewayInfo["id"];
  method: "pix" | "redirect" | "card";
  label: string;
  description: string;
  icon: typeof CreditCard;
};

// Item fixo (pagamento de encomenda sob medida) — quando presente, ignora o carrinho.
export type FixedCheckoutItem = {
  customOrderId: string;
  label: string;
  totalCents: number;
};

const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

export function CheckoutClient({
  gateways,
  shippingFlatCents,
  freeShippingAboveCents,
  shippingNote,
  fixedItem,
}: {
  gateways: GatewayInfo[];
  shippingFlatCents: number;
  freeShippingAboveCents: number;
  shippingNote: string | null;
  fixedItem?: FixedCheckoutItem;
}) {
  const { items, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const effectiveSubtotal = fixedItem ? fixedItem.totalCents : subtotalCents;
  const shipping =
    fixedItem != null
      ? 0
      : freeShippingAboveCents > 0 && effectiveSubtotal >= freeShippingAboveCents
        ? 0
        : shippingFlatCents;
  const total = effectiveSubtotal + shipping;

  const options = useMemo<PaymentOption[]>(() => {
    const list: PaymentOption[] = [];
    for (const g of gateways) {
      if (g.id === "mercadopago") {
        list.push({
          key: "mp-pix",
          provider: "mercadopago",
          method: "pix",
          label: "PIX",
          description: "Aprovação em minutos · QR Code na tela",
          icon: QrCode,
        });
        list.push({
          key: "mp-redirect",
          provider: "mercadopago",
          method: "redirect",
          label: "Cartão via Mercado Pago",
          description: "Crédito em até 12x · ambiente Mercado Pago",
          icon: CreditCard,
        });
      }
      if (g.id === "cielo") {
        list.push({
          key: "cielo-card",
          provider: "cielo",
          method: "card",
          label: "Cartão de crédito",
          description: "Direto no site, sem redirecionamento",
          icon: CreditCard,
        });
      }
      if (g.id === "stripe") {
        list.push({
          key: "stripe-redirect",
          provider: "stripe",
          method: "redirect",
          label: "Cartão internacional (Stripe)",
          description: "Checkout seguro Stripe",
          icon: Globe,
        });
      }
    }
    return list;
  }, [gateways]);

  const [selected, setSelected] = useState<string>(options[0]?.key ?? "");
  const selectedOption = options.find((o) => o.key === selected) ?? options[0];

  const empty = fixedItem ? false : items.length === 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOption) return;
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") data[key] = value;
    });

    const input: PlaceOrderInput = {
      items: fixedItem
        ? []
        : items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, qty: i.qty })),
      customOrderId: fixedItem?.customOrderId,
      data,
      payment: { provider: selectedOption.provider, method: selectedOption.method },
      card:
        selectedOption.provider === "cielo"
          ? {
              number: data.cardNumber ?? "",
              holder: data.cardHolder ?? "",
              expMonth: data.cardExpMonth ?? "",
              expYear: data.cardExpYear ?? "",
              cvv: data.cardCvv ?? "",
              installments: data.cardInstallments ?? "1",
            }
          : undefined,
    };

    startTransition(async () => {
      const result = await placeOrder(input);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.outcome.kind === "redirect") {
        if (!fixedItem) clear();
        window.location.href = result.outcome.url;
        return;
      }
      if (result.outcome.kind === "failed") {
        setError(result.outcome.message);
        router.push(`/pedido/${result.orderCode}?falha=1`);
        return;
      }
      if (!fixedItem) clear();
      router.push(`/pedido/${result.orderCode}`);
    });
  }

  if (empty) {
    return (
      <Container className="py-20 text-center">
        <p className="text-ink/60">Sua sacola está vazia — adicione peças antes do checkout.</p>
      </Container>
    );
  }

  if (options.length === 0) {
    return (
      <Container className="py-20 text-center">
        <p className="text-ink/60">
          As formas de pagamento estão sendo configuradas. Fale com a gente pelo WhatsApp para
          concluir sua compra.
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Checkout</p>
      <h1 className="font-display text-4xl font-medium">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {/* Contato */}
          <section>
            <h2 className="mb-4 font-display text-xl">Seus dados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" className="sm:col-span-2">
                <TextInput name="customerName" required autoComplete="name" />
              </Field>
              <Field label="E-mail">
                <TextInput name="customerEmail" type="email" required autoComplete="email" />
              </Field>
              <Field label="WhatsApp / telefone">
                <TextInput name="customerPhone" required autoComplete="tel" placeholder="(92) 99999-9999" />
              </Field>
              <Field label="CPF" hint="Opcional — necessário para nota fiscal">
                <TextInput name="customerCpf" inputMode="numeric" placeholder="000.000.000-00" />
              </Field>
            </div>
          </section>

          {/* Entrega */}
          <section>
            <h2 className="mb-4 font-display text-xl">Entrega</h2>
            <div className="grid gap-4 sm:grid-cols-6">
              <Field label="CEP" className="sm:col-span-2">
                <TextInput name="shipCep" required inputMode="numeric" placeholder="00000-000" />
              </Field>
              <Field label="Rua" className="sm:col-span-4">
                <TextInput name="shipStreet" required autoComplete="address-line1" />
              </Field>
              <Field label="Número" className="sm:col-span-2">
                <TextInput name="shipNumber" required />
              </Field>
              <Field label="Complemento" className="sm:col-span-4">
                <TextInput name="shipComplement" autoComplete="address-line2" />
              </Field>
              <Field label="Bairro" className="sm:col-span-2">
                <TextInput name="shipDistrict" required />
              </Field>
              <Field label="Cidade" className="sm:col-span-2">
                <TextInput name="shipCity" required autoComplete="address-level2" />
              </Field>
              <Field label="UF" className="sm:col-span-2">
                <Select name="shipState" required defaultValue="AM">
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {shippingNote ? <p className="mt-3 text-xs text-ink/55">{shippingNote}</p> : null}
          </section>

          {/* Pagamento */}
          <section>
            <h2 className="mb-4 font-display text-xl">Pagamento</h2>
            <div className="space-y-3">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOption?.key === option.key;
                return (
                  <label
                    key={option.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "border-ink/15 hover:border-ink/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value={option.key}
                      checked={isSelected}
                      onChange={() => setSelected(option.key)}
                      className="accent-(--brand-primary)"
                    />
                    <Icon className="h-5 w-5 text-accent" aria-hidden />
                    <span>
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="block text-xs text-ink/55">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedOption?.provider === "cielo" ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-ink/15 bg-white/50 p-5 sm:grid-cols-4">
                <Field label="Número do cartão" className="sm:col-span-4">
                  <TextInput name="cardNumber" inputMode="numeric" autoComplete="cc-number" required />
                </Field>
                <Field label="Nome impresso" className="sm:col-span-2">
                  <TextInput name="cardHolder" autoComplete="cc-name" required />
                </Field>
                <Field label="Mês (MM)">
                  <TextInput name="cardExpMonth" placeholder="09" maxLength={2} required />
                </Field>
                <Field label="Ano (AAAA)">
                  <TextInput name="cardExpYear" placeholder="2030" maxLength={4} required />
                </Field>
                <Field label="CVV">
                  <TextInput name="cardCvv" inputMode="numeric" maxLength={4} required />
                </Field>
                <Field label="Parcelas" className="sm:col-span-2">
                  <Select name="cardInstallments" defaultValue="1">
                    {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(Math.round(total / n))}
                        {n === 1 ? " à vista" : " sem juros"}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            ) : null}
          </section>
        </div>

        {/* Resumo */}
        <aside className="h-fit rounded-2xl border border-ink/15 bg-white/50 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl">Resumo do pedido</h2>
          <div className="mt-4 space-y-3 text-sm">
            {fixedItem ? (
              <div className="flex justify-between gap-4">
                <span className="text-ink/75">{fixedItem.label}</span>
                <span>{formatBRL(fixedItem.totalCents)}</span>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex justify-between gap-4"
                >
                  <span className="text-ink/75">
                    {item.qty}× {item.name}{" "}
                    <span className="text-ink/45">({item.size})</span>
                  </span>
                  <span>{formatBRL(item.unitCents * item.qty)}</span>
                </div>
              ))
            )}
          </div>
          <div className="my-4 h-px bg-ink/10" />
          <div className="space-y-2 text-sm text-ink/75">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatBRL(effectiveSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Frete</span>
              <span>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span>
            </div>
          </div>
          <div className="my-4 h-px bg-ink/10" />
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>

          {error ? (
            <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
          ) : null}

          <div className="mt-6">
            <Button size="lg" className="w-full" disabled={pending}>
              {pending ? "Processando…" : "Confirmar e pagar"}
            </Button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink/50">
            <Lock className="h-3 w-3" aria-hidden /> Seus dados são transmitidos com segurança
          </p>
        </aside>
      </form>
    </Container>
  );
}
