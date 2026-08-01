import { Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { PageHeader, Card, AdminField, adminInput, SubmitButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function addCategoryAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const count = await prisma.category.count();
  await prisma.category.create({
    data: { name, slug: slugify(name) || `categoria-${count + 1}`, sortOrder: count + 1 },
  });
  revalidatePath("/admin/categorias");
}

async function renameCategoryAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath("/admin/categorias");
}

async function deleteCategoryAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="Categorias" subtitle="Organize a navegação da loja." />
      <Card>
        <div className="divide-y divide-slate-100">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-wrap items-center gap-3 py-3">
              <form action={renameCategoryAction} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={category.id} />
                <input name="name" defaultValue={category.name} className={`${adminInput} max-w-72`} />
                <button type="submit" className="text-xs text-slate-500 underline hover:text-slate-900">
                  renomear
                </button>
              </form>
              <span className="text-xs text-slate-400">
                {category._count.products} peça{category._count.products === 1 ? "" : "s"}
              </span>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" aria-label="Excluir categoria" className="p-1 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </div>
          ))}
          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Nenhuma categoria ainda.</p>
          ) : null}
        </div>
        <form action={addCategoryAction} className="mt-5 flex items-end gap-3 border-t border-slate-100 pt-5">
          <AdminField label="Nova categoria" className="flex-1">
            <input name="name" placeholder="Ex.: Vestidos" className={adminInput} />
          </AdminField>
          <SubmitButton>Adicionar</SubmitButton>
        </form>
      </Card>
    </>
  );
}
