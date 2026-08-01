"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { parseBRLToCents } from "@/lib/money";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

function productDataFromForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const priceCents = parseBRLToCents(String(formData.get("price") ?? ""));
  const compareAtCents = parseBRLToCents(String(formData.get("compareAt") ?? ""));
  if (!name) throw new Error("Informe o nome da peça.");
  if (!priceCents) throw new Error("Informe um preço válido.");
  return {
    name,
    slug: slugify(slugInput || name),
    description: String(formData.get("description") ?? "").trim(),
    fabric: String(formData.get("fabric") ?? "linho"),
    priceCents,
    compareAtCents: compareAtCents || null,
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    allowCustomOrder: formData.get("allowCustomOrder") === "on",
    categoryId: String(formData.get("categoryId") ?? "") || null,
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdminSession();
  const data = productDataFromForm(formData);
  const product = await prisma.product.create({ data });
  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${product.id}`);
}

export async function updateProductAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const data = productDataFromForm(formData);
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/produtos");
  revalidatePath(`/produto/${data.slug}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

// ---------- imagens ----------
export async function addProductImageAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, url, alt: String(formData.get("alt") ?? ""), sortOrder: count },
  });
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const image = await prisma.productImage.delete({ where: { id } });
  revalidatePath(`/admin/produtos/${image.productId}`);
}

// ---------- variações / estoque ----------
export async function addVariantAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const size = String(formData.get("size") ?? "").trim();
  if (!size) return;
  const count = await prisma.productVariant.count({ where: { productId } });
  await prisma.productVariant.create({
    data: {
      productId,
      size,
      color: String(formData.get("color") ?? "").trim(),
      stock: Math.max(0, Number(formData.get("stock") ?? 0) || 0),
      sortOrder: count,
    },
  });
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function updateVariantAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const variant = await prisma.productVariant.update({
    where: { id },
    data: { stock: Math.max(0, Number(formData.get("stock") ?? 0) || 0) },
  });
  revalidatePath(`/admin/produtos/${variant.productId}`);
}

export async function deleteVariantAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const variant = await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/produtos/${variant.productId}`);
}
