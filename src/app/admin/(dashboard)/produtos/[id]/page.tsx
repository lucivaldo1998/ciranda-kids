import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, AdminField, adminInput, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  updateProductAction,
  deleteProductAction,
  addProductImageAction,
  deleteProductImageAction,
  addVariantAction,
  updateVariantAction,
  deleteVariantAction,
} from "../actions";
import { ProductFields } from "../ProductFields";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle="Edite os dados, fotos e estoque da peça."
        action={
          <Link
            href={`/produto/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden /> Ver na loja
          </Link>
        }
      />

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 font-semibold">Dados da peça</h2>
          <form action={updateProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <ProductFields product={product} categories={categories} />
            <div className="mt-6 text-right">
              <SubmitButton>Salvar alterações</SubmitButton>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Fotos</h2>
          <div className="flex flex-wrap gap-4">
            {product.images.map((image) => (
              <div key={image.id} className="relative">
                <div className="h-40 w-30 overflow-hidden rounded border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                </div>
                <form action={deleteProductImageAction} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={image.id} />
                  <button
                    type="submit"
                    aria-label="Excluir foto"
                    className="rounded bg-black/60 p-1 text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </form>
              </div>
            ))}
          </div>
          <form action={addProductImageAction} className="mt-5 flex flex-wrap items-end gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <ImageUploadField name="url" label="Adicionar foto" />
            <SubmitButton>Adicionar</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Tamanhos & estoque</h2>
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div key={variant.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-2">
                <span className="w-16 text-sm font-medium">{variant.size}</span>
                <span className="w-28 text-sm text-slate-500">{variant.color || "—"}</span>
                <form action={updateVariantAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={variant.id} />
                  <input
                    type="number"
                    name="stock"
                    min={0}
                    defaultValue={variant.stock}
                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <button type="submit" className="text-xs text-slate-500 underline hover:text-slate-900">
                    salvar estoque
                  </button>
                </form>
                <form action={deleteVariantAction} className="ml-auto">
                  <input type="hidden" name="id" value={variant.id} />
                  <button type="submit" aria-label="Excluir variação" className="p-1 text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              </div>
            ))}
            {product.variants.length === 0 ? (
              <p className="py-3 text-sm text-slate-400">
                Nenhum tamanho cadastrado — a peça aparece como esgotada.
              </p>
            ) : null}
          </div>
          <form action={addVariantAction} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <AdminField label="Tamanho">
              <input name="size" placeholder="M" required className={`${adminInput} w-24`} />
            </AdminField>
            <AdminField label="Cor (opcional)">
              <input name="color" placeholder="Cru" className={`${adminInput} w-32`} />
            </AdminField>
            <AdminField label="Estoque">
              <input type="number" name="stock" min={0} defaultValue={1} className={`${adminInput} w-24`} />
            </AdminField>
            <SubmitButton>Adicionar tamanho</SubmitButton>
          </form>
        </Card>

        <Card className="border-red-200">
          <h2 className="font-semibold text-red-700">Zona de perigo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Excluir a peça remove fotos e variações. Pedidos existentes são preservados.
          </p>
          <form action={deleteProductAction} className="mt-3">
            <input type="hidden" name="id" value={product.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Excluir peça
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
