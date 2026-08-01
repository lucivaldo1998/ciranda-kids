"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Variant = { id: string; size: string; color: string; stock: number };

export function AddToCart({
  product,
  variants,
}: {
  product: {
    productId: string;
    slug: string;
    name: string;
    unitCents: number;
    imageUrl: string | null;
  };
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const available = variants.filter((v) => v.stock > 0);
  const [selected, setSelected] = useState<Variant | null>(
    available.length === 1 ? available[0] : null
  );
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAdd(goToCart: boolean) {
    if (!selected) {
      setError("Escolha um tamanho.");
      return;
    }
    setError(null);
    addItem({
      productId: product.productId,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      color: selected.color,
      unitCents: product.unitCents,
      imageUrl: product.imageUrl,
    });
    if (goToCart) {
      router.push("/carrinho");
    } else {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-ink/60">Tamanho</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const soldOut = variant.stock <= 0;
          const isSelected = selected?.id === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={soldOut}
              onClick={() => setSelected(variant)}
              className={cn(
                "min-w-12 rounded-full border px-3 py-2 text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary text-canvas"
                  : "border-ink/25 text-ink hover:border-ink",
                soldOut && "cursor-not-allowed opacity-35 line-through"
              )}
            >
              {variant.size}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
      {available.length === 0 ? (
        <p className="mt-3 text-sm text-ink/60">
          Peça esgotada no momento — encomende no Ateliê sob medida.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          disabled={available.length === 0}
          onClick={() => handleAdd(true)}
        >
          Comprar agora
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={available.length === 0}
          onClick={() => handleAdd(false)}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Adicionado
            </>
          ) : (
            "Adicionar à sacola"
          )}
        </Button>
      </div>
    </div>
  );
}
