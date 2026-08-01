// Dados de demonstração compartilhados entre o seed local (prisma/seed.ts)
// e a rota de bootstrap do banco em produção (/api/admin/bootstrap).

export const DEMO_CATEGORIES = [
  { slug: "vestidos", name: "Vestidos", sortOrder: 1 },
  { slug: "conjuntos", name: "Conjuntos", sortOrder: 2 },
  { slug: "camisetas", name: "Camisetas & Blusas", sortOrder: 3 },
  { slug: "fundos", name: "Shorts & Calças", sortOrder: 4 },
  { slug: "festa", name: "Festa", sortOrder: 5 },
  { slug: "acessorios", name: "Acessórios", sortOrder: 6 },
] as const;

export const DEMO_PRODUCTS = [
  { slug: "vestido-borboleta", name: "Vestido Borboleta", fabric: "algodao", cat: "vestidos", price: 18900, featured: true, desc: "Vestido rodado em tricoline de algodão, com bolsos (porque criança precisa de bolso) e botões nas costas. Roda que rende no giro." },
  { slug: "vestido-festa-estrela", name: "Vestido de Festa Estrela", fabric: "algodao", cat: "festa", price: 32900, featured: true, desc: "Vestido de festa com saia em camadas e forro macio de algodão. Brilha na foto, não coça na pele." },
  { slug: "conjunto-dino", name: "Conjunto Dino", fabric: "malha", cat: "conjuntos", price: 15900, featured: true, desc: "Camiseta + short em malha de algodão penteado. Costuras reforçadas para aguentar qualquer expedição jurássica." },
  { slug: "macacao-nuvem", name: "Macacão Nuvem", fabric: "malha", cat: "conjuntos", price: 13900, featured: true, desc: "Macacão levinho de malha, sem etiqueta pinicando e com botões de pressão. Conforto de dormir e de brincar." },
  { slug: "camiseta-sol", name: "Camiseta Sol", fabric: "algodao", cat: "camisetas", price: 7900, featured: false, desc: "Camiseta básica de algodão penteado, gola que não deforma e cores que não desbotam na primeira lavagem." },
  { slug: "short-pipa", name: "Short Pipa", fabric: "algodao", cat: "fundos", price: 8900, featured: false, desc: "Short de sarja leve com cós de elástico confortável e bolsos fundos para guardar tesouros." },
  { slug: "calca-cirandinha", name: "Calça Cirandinha", fabric: "linho", cat: "fundos", price: 11900, featured: true, desc: "Calça fresquinha de linho misto com punho ajustável — cresce um pouco junto com a criança." },
  { slug: "laco-arco-iris", name: "Laço Arco-Íris", fabric: "algodao", cat: "acessorios", price: 3900, featured: false, desc: "Laço de cabelo em algodão com forro antideslizante. O toque final do look." },
] as const;

export const DEMO_SIZES = ["2 anos", "4 anos", "6 anos", "8 anos", "10 anos"];

export const ACCESSORY_CATEGORY = "acessorios";
