import Link from "next/link";
import { fabricLabel } from "@/lib/fabrics";
import { formatBRL } from "@/lib/money";

export type ProductCardData = {
  slug: string;
  name: string;
  fabric: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink/5">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : null}
        <span className="absolute left-3 top-3 rounded-full bg-canvas/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink/70">
          {fabricLabel(product.fabric)}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-display text-lg text-ink group-hover:text-accent transition-colors">
          {product.name}
        </p>
        <p className="shrink-0 text-sm text-ink/80">
          {product.compareAtCents ? (
            <span className="mr-2 text-ink/40 line-through">{formatBRL(product.compareAtCents)}</span>
          ) : null}
          {formatBRL(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
