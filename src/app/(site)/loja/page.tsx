import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FABRICS } from "@/lib/fabrics";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Loja" };

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; tecido?: string }>;
}) {
  const { categoria, tecido } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(tecido ? { fabric: tecido } : {}),
        ...(categoria ? { category: { slug: categoria } } : {}),
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const filterHref = (params: { categoria?: string; tecido?: string }) => {
    const merged = { categoria, tecido, ...params };
    const query = new URLSearchParams();
    if (merged.categoria) query.set("categoria", merged.categoria);
    if (merged.tecido) query.set("tecido", merged.tecido);
    const qs = query.toString();
    return qs ? `/loja?${qs}` : "/loja";
  };

  return (
    <Container className="py-14">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Coleção</p>
      <h1 className="font-display text-4xl font-medium">A loja</h1>

      {/* Filtros */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href={filterHref({ categoria: undefined })}
          className={cn(
            "border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors",
            !categoria ? "border-primary bg-primary text-canvas" : "border-ink/20 text-ink/70 hover:border-ink"
          )}
        >
          Tudo
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={filterHref({ categoria: c.slug === categoria ? undefined : c.slug })}
            className={cn(
              "border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors",
              categoria === c.slug
                ? "border-primary bg-primary text-canvas"
                : "border-ink/20 text-ink/70 hover:border-ink"
            )}
          >
            {c.name}
          </Link>
        ))}
        <span className="mx-2 hidden h-5 w-px bg-ink/15 sm:block" />
        {FABRICS.map((f) => (
          <Link
            key={f.key}
            href={filterHref({ tecido: f.key === tecido ? undefined : f.key })}
            className={cn(
              "border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors",
              tecido === f.key
                ? "border-accent bg-accent text-canvas"
                : "border-ink/20 text-ink/70 hover:border-ink"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-ink/60">
          Nenhuma peça encontrada com esses filtros — experimente limpar a seleção.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                slug: product.slug,
                name: product.name,
                fabric: product.fabric,
                priceCents: product.priceCents,
                compareAtCents: product.compareAtCents,
                imageUrl: product.images[0]?.url ?? null,
              }}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
