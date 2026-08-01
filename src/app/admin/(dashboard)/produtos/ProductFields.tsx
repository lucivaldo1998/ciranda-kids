import { AdminField, adminInput } from "@/components/admin/ui";
import { FABRICS } from "@/lib/fabrics";

type ProductLike = {
  name: string;
  slug: string;
  description: string;
  fabric: string;
  priceCents: number;
  compareAtCents: number | null;
  active: boolean;
  featured: boolean;
  allowCustomOrder: boolean;
  categoryId: string | null;
};

// Campos compartilhados entre "nova peça" e "editar peça" (server component).
export function ProductFields({
  product,
  categories,
}: {
  product: ProductLike | null;
  categories: { id: string; name: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminField label="Nome da peça" className="sm:col-span-2">
        <input name="name" required defaultValue={product?.name ?? ""} className={adminInput} />
      </AdminField>
      <AdminField label="Slug (URL)" hint="Deixe vazio para gerar do nome">
        <input name="slug" defaultValue={product?.slug ?? ""} className={adminInput} />
      </AdminField>
      <AdminField label="Categoria">
        <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={adminInput}>
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </AdminField>
      <AdminField label="Tecido">
        <select name="fabric" defaultValue={product?.fabric ?? "linho"} className={adminInput}>
          {FABRICS.map((fabric) => (
            <option key={fabric.key} value={fabric.key}>
              {fabric.label}
            </option>
          ))}
        </select>
      </AdminField>
      <AdminField label="Preço (R$)">
        <input
          name="price"
          required
          defaultValue={product ? (product.priceCents / 100).toFixed(2).replace(".", ",") : ""}
          className={adminInput}
          placeholder="789,00"
        />
      </AdminField>
      <AdminField label="Preço “de” riscado (opcional)">
        <input
          name="compareAt"
          defaultValue={
            product?.compareAtCents ? (product.compareAtCents / 100).toFixed(2).replace(".", ",") : ""
          }
          className={adminInput}
        />
      </AdminField>
      <AdminField label="Descrição" className="sm:col-span-2">
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          className={`${adminInput} min-h-28`}
        />
      </AdminField>
      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Visível na loja
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Destaque na home
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="allowCustomOrder"
            defaultChecked={product?.allowCustomOrder ?? true}
          />
          Pode ser base do Ateliê sob medida
        </label>
      </div>
    </div>
  );
}
