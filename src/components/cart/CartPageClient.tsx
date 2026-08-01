"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatBRL } from "@/lib/money";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export function CartPageClient() {
  const { items, subtotalCents, setQty, removeItem } = useCart();

  return (
    <Container className="py-14">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Sacola</p>
      <h1 className="font-display text-4xl font-medium">Seu carrinho</h1>

      {items.length === 0 ? (
        <div className="mt-14 text-center">
          <p className="text-ink/60">Sua sacola está vazia.</p>
          <div className="mt-6">
            <ButtonLink href="/loja" variant="outline">
              Ver a coleção
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-ink/10">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-5 py-6">
                <Link href={`/produto/${item.slug}`} className="block h-32 w-24 shrink-0 bg-ink/5">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/produto/${item.slug}`}
                        className="font-display text-lg hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ink/50">
                        Tam. {item.size}
                        {item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <p className="text-sm">{formatBRL(item.unitCents * item.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-ink/20">
                      <button
                        type="button"
                        className="p-2 hover:bg-ink/5"
                        onClick={() => setQty(item.productId, item.size, item.color, item.qty - 1)}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <span className="w-10 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        className="p-2 hover:bg-ink/5"
                        onClick={() => setQty(item.productId, item.size, item.color, item.qty + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-red-700"
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-ink/15 bg-white/50 p-6">
            <h2 className="font-display text-xl">Resumo</h2>
            <div className="mt-4 space-y-2 text-sm text-ink/75">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatBRL(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="text-ink/50">calculado no checkout</span>
              </div>
            </div>
            <div className="my-4 h-px bg-ink/10" />
            <div className="flex justify-between text-base font-medium">
              <span>Total parcial</span>
              <span>{formatBRL(subtotalCents)}</span>
            </div>
            <div className="mt-6">
              <ButtonLink href="/checkout" size="lg" className="w-full">
                Finalizar compra
              </ButtonLink>
            </div>
            <p className="mt-4 text-center text-xs text-ink/50">
              Pagamento seguro · PIX ou cartão
            </p>
          </aside>
        </div>
      )}
    </Container>
  );
}
