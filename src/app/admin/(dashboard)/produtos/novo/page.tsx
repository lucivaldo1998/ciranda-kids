import { prisma } from "@/lib/prisma";
import { PageHeader, Card, SubmitButton } from "@/components/admin/ui";
import { createProductAction } from "../actions";
import { ProductFields } from "../ProductFields";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader title="Nova peça" subtitle="Depois de criar, você adiciona fotos e tamanhos." />
      <Card>
        <form action={createProductAction}>
          <ProductFields product={null} categories={categories} />
          <div className="mt-6 text-right">
            <SubmitButton>Criar peça</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
