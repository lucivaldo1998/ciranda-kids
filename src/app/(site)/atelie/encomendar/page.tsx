import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai";
import { Container } from "@/components/ui/Container";
import { AtelierWizard } from "@/components/atelier/AtelierWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Encomendar sob medida" };

export default async function EncomendarPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo } = await searchParams;
  const [products, aiEnabled] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, allowCustomOrder: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    isAiConfigured(),
  ]);

  const preselected = modelo ? products.find((p) => p.slug === modelo) : null;

  return (
    <Container className="py-14">
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Ateliê sob medida</p>
        <h1 className="font-display text-4xl font-medium">Vamos criar a sua peça</h1>
      </div>
      <AtelierWizard
        baseModels={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceCents: p.priceCents,
          imageUrl: p.images[0]?.url ?? null,
        }))}
        aiEnabled={aiEnabled}
        preselectedModelId={preselected?.id ?? null}
      />
    </Container>
  );
}
