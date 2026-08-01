import Link from "next/link";
import { notFound } from "next/navigation";
import { Ruler, Leaf, HandHeart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fabricLabel } from "@/lib/fabrics";
import { formatBRL } from "@/lib/money";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCart } from "@/components/store/AddToCart";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
  if (!product || !product.active) notFound();

  return (
    <Container className="py-12">
      <nav className="mb-8 text-xs uppercase tracking-[0.18em] text-ink/50">
        <Link href="/loja" className="hover:text-ink">
          Loja
        </Link>
        {product.category ? (
          <>
            {" / "}
            <Link href={`/loja?categoria=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-ink/80">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
          name={product.name}
        />

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">
            {fabricLabel(product.fabric)} · Conforto para brincar
          </p>
          <h1 className="font-display text-4xl font-medium">{product.name}</h1>
          <p className="mt-4 text-2xl text-ink">
            {product.compareAtCents ? (
              <span className="mr-3 text-lg text-ink/40 line-through">
                {formatBRL(product.compareAtCents)}
              </span>
            ) : null}
            {formatBRL(product.priceCents)}
          </p>

          <div className="my-8 h-px bg-ink/10" />

          <AddToCart
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              unitCents: product.priceCents,
              imageUrl: product.images[0]?.url ?? null,
            }}
            variants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              stock: v.stock,
            }))}
          />

          {product.allowCustomOrder ? (
            <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/5 p-4 text-sm text-ink/80">
              <p>
                <strong className="font-medium">Quer sob medida?</strong> Esta peça pode ser
                feita nas medidas do seu pequeno — em outro tecido, cor ou tema de festa.
              </p>
              <Link
                href={`/atelie/encomendar?modelo=${product.slug}`}
                className="mt-2 inline-block text-xs font-medium uppercase tracking-[0.18em] text-accent hover:underline"
              >
                Encomendar sob medida →
              </Link>
            </div>
          ) : null}

          <div className="mt-10 space-y-4 text-sm leading-relaxed text-ink/75">
            {product.description.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-10 space-y-3 border-t border-ink/10 pt-6 text-sm text-ink/70">
            <li className="flex items-center gap-3">
              <Leaf className="h-4 w-4 text-accent" aria-hidden />
              Tecidos macios e seguros para a pele
            </li>
            <li className="flex items-center gap-3">
              <HandHeart className="h-4 w-4 text-accent" aria-hidden />
              Costura artesanal reforçada — aguenta infância de verdade
            </li>
            <li className="flex items-center gap-3">
              <Ruler className="h-4 w-4 text-accent" aria-hidden />
              Também fazemos sob medida, nas medidas do seu pequeno
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
