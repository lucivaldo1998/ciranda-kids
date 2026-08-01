import Link from "next/link";
import { ArrowRight, Scissors, Ruler, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getContent, defaultHome } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, featured] = await Promise.all([
    getContent("home", defaultHome),
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82vh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
        <Container className="relative pb-16 pt-40 text-canvas">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-canvas/80">
            {content.heroKicker}
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight sm:text-6xl">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-base text-canvas/85 sm:text-lg">{content.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/loja" variant="accent" size="lg">
              {content.heroCtaLabel}
            </ButtonLink>
            <ButtonLink
              href="/atelie"
              variant="outline"
              size="lg"
              className="border-canvas/50 text-canvas hover:border-canvas hover:bg-canvas/10"
            >
              Ateliê sob medida
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Destaques */}
      <section className="py-20">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Coleção</p>
              <h2 className="font-display text-3xl font-medium sm:text-4xl">Peças em destaque</h2>
            </div>
            <Link
              href="/loja"
              className="hidden items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink sm:flex"
            >
              Ver tudo <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {featured.map((product) => (
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
          <div className="mt-10 text-center sm:hidden">
            <ButtonLink href="/loja" variant="outline">
              Ver toda a coleção
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Tecidos */}
      <section className="border-y border-ink/10 bg-white/40 py-20">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Tecidos que abraçam</p>
            <h2 className="font-display text-3xl font-medium sm:text-4xl">{content.fabricsTitle}</h2>
            <p className="mt-4 text-ink/70">{content.fabricsIntro}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { name: "Algodão", text: content.fabricCotton },
              { name: "Linho", text: content.fabricLinen },
              { name: "Malha", text: content.fabricSilk },
            ].map((fabric) => (
              <div key={fabric.name} className="text-center">
                <p className="font-display text-2xl text-ink">{fabric.name}</p>
                <div className="mx-auto my-4 h-px w-10 bg-accent" />
                <p className="text-sm leading-relaxed text-ink/70">{fabric.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Ateliê */}
      <section className="py-20">
        <Container className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.atelierImageUrl}
              alt="Ateliê sob medida"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Exclusivo</p>
            <h2 className="font-display text-3xl font-medium sm:text-4xl">{content.atelierTitle}</h2>
            <p className="mt-4 leading-relaxed text-ink/70">{content.atelierText}</p>
            <ul className="mt-6 space-y-3 text-sm text-ink/80">
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                Festa, fantasia, personagem ou croqui gerado por IA
              </li>
              <li className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-accent" aria-hidden />
                Ajustado às medidas do seu pequeno, não ao manequim
              </li>
              <li className="flex items-center gap-3">
                <Scissors className="h-4 w-4 text-accent" aria-hidden />
                Corte e costura à mão por Cleide Lopes
              </li>
            </ul>
            <div className="mt-8">
              <ButtonLink href="/atelie" size="lg">
                Começar minha peça
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
