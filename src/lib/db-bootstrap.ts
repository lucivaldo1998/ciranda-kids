import { Pool } from "pg";
import { prisma } from "./prisma";
import { defaultSettings } from "./settings";
import { PG_DDL } from "./db-ddl";
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_SIZES, ACCESSORY_CATEGORY } from "./seed-data";

// Cria as tabelas (idempotente) e os dados iniciais direto pelo servidor.
// Usado pela rota /api/admin/bootstrap — assim dá para publicar na Vercel + Supabase
// sem rodar nenhum comando de banco na sua máquina.

export async function ensureSchema(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    await pool.query(PG_DDL);
  } finally {
    await pool.end();
  }
}

export async function seedDefaults(forceSettings = false) {
  const { id: _id, ...settingDefaults } = defaultSettings;
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: forceSettings ? settingDefaults : {},
    create: { id: "singleton", ...settingDefaults },
  });

  for (const gatewayId of ["mercadopago", "stripe", "cielo"]) {
    await prisma.paymentGateway.upsert({
      where: { id: gatewayId },
      update: {},
      create: { id: gatewayId, active: false, testMode: true },
    });
  }

  for (const c of DEMO_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // Produtos de demonstração só entram se o catálogo estiver vazio.
  const productCount = await prisma.product.count();
  let created = 0;
  if (productCount === 0) {
    const categories = await prisma.category.findMany();
    const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));
    for (const p of DEMO_PRODUCTS) {
      const isAccessory = p.cat === ACCESSORY_CATEGORY;
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.desc,
          fabric: p.fabric,
          priceCents: p.price,
          featured: p.featured,
          allowCustomOrder: !isAccessory,
          categoryId: catBySlug.get(p.cat) ?? null,
          images: { create: [{ url: `/uploads/demo/${p.slug}.svg`, alt: p.name, sortOrder: 0 }] },
          variants: {
            create: isAccessory
              ? [{ size: "Único", stock: 12, sortOrder: 0 }]
              : DEMO_SIZES.map((size, i) => ({ size, stock: 3, sortOrder: i })),
          },
        },
      });
      created += 1;
    }
  }
  return { demoProductsCreated: created };
}
