// Dados de demonstração — rode com: npm run db:seed
// (em produção na Vercel, use a rota /api/admin/bootstrap, que já faz tudo isso)
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_SIZES, ACCESSORY_CATEGORY } from "../src/lib/seed-data";

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error("Configure DATABASE_URL com a URL do Postgres (Supabase) no arquivo .env");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// ---------- imagens de demonstração (SVG alegres, trocáveis pelo painel) ----------
const DEMO_DIR = path.join(process.cwd(), "public", "uploads", "demo");

function productSvg(label: string, tone1: string, tone2: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${tone1}"/>
      <stop offset="1" stop-color="${tone2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <circle cx="110" cy="130" r="42" fill="#ffffff55"/>
  <circle cx="500" cy="620" r="64" fill="#ffffff40"/>
  <circle cx="480" cy="180" r="26" fill="#ffffff4d"/>
  <rect x="40" y="40" width="520" height="720" rx="28" fill="none" stroke="#00000022" stroke-width="1.5"/>
  <text x="300" y="410" text-anchor="middle" font-family="Verdana, sans-serif" font-size="30" font-weight="bold" letter-spacing="3" fill="#4a3a30">${label.toUpperCase()}</text>
  <text x="300" y="450" text-anchor="middle" font-family="Verdana, sans-serif" font-size="12" letter-spacing="3" fill="#4a3a3099">CIRANDA · FOTO ILUSTRATIVA</text>
</svg>`;
}

function wideSvg(label: string, sub: string, tone1: string, tone2: string, w = 1600, h = 900) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0" stop-color="${tone1}"/>
      <stop offset="1" stop-color="${tone2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.12}" cy="${h * 0.22}" r="${h * 0.09}" fill="#ffffff4d"/>
  <circle cx="${w * 0.85}" cy="${h * 0.7}" r="${h * 0.13}" fill="#ffffff40"/>
  <circle cx="${w * 0.75}" cy="${h * 0.2}" r="${h * 0.05}" fill="#ffffff55"/>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="${h * 0.075}" font-weight="bold" letter-spacing="8" fill="#4a3a30">${label.toUpperCase()}</text>
  <text x="${w / 2}" y="${h / 2 + h * 0.08}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="${h * 0.026}" letter-spacing="5" fill="#4a3a3099">${sub.toUpperCase()}</text>
</svg>`;
}

function writeDemoImages() {
  fs.mkdirSync(DEMO_DIR, { recursive: true });
  const files: Record<string, string> = {
    "hero.svg": wideSvg("", "", "#ffe0b8", "#ffb98a"),
    "atelie.svg": wideSvg("Ateliê dos sonhos", "Sob medida por Cleide Lopes", "#cfe8e0", "#9fcfc0", 1200, 900),
    "sobre.svg": wideSvg("Nossa história", "Feito à mão, com carinho", "#ffe8cf", "#f7c8a4", 1200, 900),
  };
  const tones: Record<string, [string, string]> = {
    algodao: ["#ffe3c9", "#ffc59e"],
    malha: ["#cde9ff", "#9fd0f5"],
    linho: ["#e6f0d8", "#c3dcae"],
  };
  for (const p of DEMO_PRODUCTS) {
    const [t1, t2] = tones[p.fabric] ?? tones.algodao;
    files[`${p.slug}.svg`] = productSvg(p.name, t1, t2);
  }
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(DEMO_DIR, name), content);
  }
}

async function main() {
  writeDemoImages();

  await prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });

  for (const gatewayId of ["mercadopago", "stripe", "cielo"]) {
    await prisma.paymentGateway.upsert({
      where: { id: gatewayId },
      update: {},
      create: { id: gatewayId, active: false, testMode: true },
    });
  }

  for (const c of DEMO_CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const p of DEMO_PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
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
            ? [{ size: "Único", stock: 15, sortOrder: 0 }]
            : DEMO_SIZES.map((size, i) => ({ size, stock: 3, sortOrder: i })),
        },
      },
    });
  }

  console.log("Seed concluído: configurações, gateways, categorias e produtos de demonstração.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
