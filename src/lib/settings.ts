import { prisma } from "@/lib/prisma";

export const defaultSettings = {
  id: "singleton",
  brandName: "CIRANDA",
  tagline: "Moda infantil feita com carinho",
  whatsapp: "5592999999999",
  email: null as string | null,
  phone: null as string | null,
  instagram: null as string | null,
  address: null as string | null,
  cnpj: null as string | null,
  announcement: null as string | null,
  primaryColor: "#2A6F63",
  accentColor: "#F2803B",
  backgroundColor: "#FFF7EC",
  logoUrl: null as string | null,
  seoTitle: null as string | null,
  seoDescription: null as string | null,
  shippingFlatCents: 1800,
  freeShippingAboveCents: 30000,
  shippingNote: "Prazo de produção e envio combinados via WhatsApp após a compra." as string | null,
  openaiKeyCiphertext: null as string | null,
  openaiKeyIv: null as string | null,
  openaiKeyTag: null as string | null,
};

export type Settings = typeof defaultSettings;

export async function getSettings(): Promise<Settings> {
  try {
    const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
    return (setting as Settings | null) ?? defaultSettings;
  } catch {
    // Banco ainda não inicializado (ex.: antes do /api/admin/bootstrap) — usa os padrões.
    return defaultSettings;
  }
}
