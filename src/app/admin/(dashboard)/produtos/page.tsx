import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { fabricLabel } from "@/lib/fabrics";
import { PageHeader, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} peças no catálogo`}
        action={
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" aria-hidden /> Nova peça
          </Link>
        }
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Peça</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Tecido</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/produtos/${product.id}`} className="flex items-center gap-3">
                      <span className="block h-12 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </span>
                      <span className="font-medium">
                        {product.name}
                        {product.featured ? (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                            destaque
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{fabricLabel(product.fabric)}</td>
                  <td className="px-4 py-3">{formatBRL(product.priceCents)}</td>
                  <td className="px-4 py-3">
                    <span className={stock <= 2 ? "font-medium text-red-600" : ""}>{stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        product.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {product.active ? "Ativo" : "Oculto"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhum produto ainda — clique em “Nova peça”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
