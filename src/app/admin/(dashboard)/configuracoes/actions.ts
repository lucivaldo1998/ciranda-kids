"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { parseBRLToCents } from "@/lib/money";

function str(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdminSession();

  const shippingFlat = parseBRLToCents(String(formData.get("shippingFlat") ?? "")) ?? 0;
  const freeAbove = parseBRLToCents(String(formData.get("freeShippingAbove") ?? "")) ?? 0;

  const data = {
    brandName: str(formData, "brandName") ?? "ALVA",
    tagline: str(formData, "tagline") ?? "",
    whatsapp: (str(formData, "whatsapp") ?? "").replace(/\D/g, ""),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    instagram: str(formData, "instagram"),
    address: str(formData, "address"),
    cnpj: str(formData, "cnpj"),
    announcement: str(formData, "announcement"),
    primaryColor: str(formData, "primaryColor") ?? "#3E4A3D",
    accentColor: str(formData, "accentColor") ?? "#B26E4B",
    backgroundColor: str(formData, "backgroundColor") ?? "#F7F3EC",
    logoUrl: str(formData, "logoUrl"),
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    shippingFlatCents: shippingFlat,
    freeShippingAboveCents: freeAbove,
    shippingNote: str(formData, "shippingNote"),
  };

  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/", "layout");
}

export async function saveOpenAiKeyAction(formData: FormData) {
  await requireAdminSession();
  const key = String(formData.get("openaiKey") ?? "").trim();
  if (!key) return;

  const enc = encrypt(key);
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {
      openaiKeyCiphertext: enc.ciphertext,
      openaiKeyIv: enc.iv,
      openaiKeyTag: enc.authTag,
    },
    create: {
      id: "singleton",
      openaiKeyCiphertext: enc.ciphertext,
      openaiKeyIv: enc.iv,
      openaiKeyTag: enc.authTag,
    },
  });

  revalidatePath("/admin/configuracoes");
}

export async function removeOpenAiKeyAction() {
  await requireAdminSession();
  await prisma.setting.update({
    where: { id: "singleton" },
    data: { openaiKeyCiphertext: null, openaiKeyIv: null, openaiKeyTag: null },
  });
  revalidatePath("/admin/configuracoes");
}
