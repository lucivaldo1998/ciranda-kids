import { prisma } from "@/lib/prisma";

// Conteúdo editável do site (painel → Conteúdo). Cada chave guarda um JSON que é
// mesclado sobre os padrões abaixo — campos novos ganham default automaticamente.

export type HomeContent = {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroImageUrl: string;
  fabricsTitle: string;
  fabricsIntro: string;
  fabricLinen: string;
  fabricSilk: string;
  fabricCotton: string;
  atelierTitle: string;
  atelierText: string;
  atelierImageUrl: string;
};

export const defaultHome: HomeContent = {
  heroKicker: "Algodão macio · Cores alegres",
  heroTitle: "Roupas de brincar, feitas para durar",
  heroSubtitle:
    "Peças infantis costuradas com capricho pelo ateliê de Cleide Lopes — confortáveis no corpo, lindas na foto e prontas para o parquinho.",
  heroCtaLabel: "Ver a lojinha",
  heroImageUrl: "/uploads/demo/hero.svg",
  fabricsTitle: "Tecidos que a pele agradece",
  fabricsIntro:
    "Criança sente tudo. Por isso escolhemos tramas macias, respiráveis e resistentes às maiores aventuras.",
  fabricCotton:
    "Macio, respirável e aguenta lavagem atrás de lavagem — o melhor amigo do dia a dia.",
  fabricLinen: "Fresquinho para os dias quentes e cada vez mais macio com o uso.",
  fabricSilk: "Elástica e confortável: liberdade total para correr, pular e rolar.",
  atelierTitle: "Ateliê dos sonhos",
  atelierText:
    "Roupa de festa, look de personagem ou aquele vestido que só existe na imaginação: envie a referência, informe as medidas e a Cleide costura uma peça única para o seu pequeno.",
  atelierImageUrl: "/uploads/demo/atelie.svg",
};

export type AboutContent = {
  title: string;
  text: string;
  imageUrl: string;
};

export const defaultAbout: AboutContent = {
  title: "Costura de gente grande para gente pequena",
  text: "Por trás da CIRANDA está Cleide Lopes — costureira de mão cheia, com décadas de tesoura, régua e linha. Cada peça que sai daqui passou pelas mãos dela: do corte ao último acabamento.\n\nRoupa de criança precisa aguentar infância de verdade: grama, tinta, cambalhota e abraço apertado. Por isso produzimos pouco e caprichamos muito — costuras reforçadas, tecidos macios e modelagem que deixa o corpo brincar.",
  imageUrl: "/uploads/demo/sobre.svg",
};

export type AtelierContent = {
  title: string;
  intro: string;
  step1Title: string;
  step1Text: string;
  step2Title: string;
  step2Text: string;
  step3Title: string;
  step3Text: string;
};

export const defaultAtelier: AtelierContent = {
  title: "Uma peça única para uma infância única",
  intro:
    "O Ateliê é o nosso serviço especial: roupa de festa, fantasia ou aquele modelo que não existe em loja nenhuma — desenhado com você e costurado à mão pela Cleide, nas medidas do seu pequeno.",
  step1Title: "1 · Escolha o ponto de partida",
  step1Text:
    "Parta de uma peça da lojinha, envie uma foto de referência (festa, fantasia, personagem favorito) ou descreva a ideia e gere um croqui com IA.",
  step2Title: "2 · Medidas do pequeno",
  step2Text:
    "Um formulário guiado, com dicas de como medir. Na dúvida, a gente confirma tudo com você pelo WhatsApp antes de cortar o tecido.",
  step3Title: "3 · Orçamento e produção",
  step3Text:
    "A Cleide avalia a peça, você recebe o orçamento e acompanha cada etapa — do corte à entrega — pela página da encomenda.",
};

export async function getContent<T extends object>(key: string, defaults: T): Promise<T> {
  try {
    const row = await prisma.contentBlock.findUnique({ where: { key } });
    if (!row) return defaults;
    return { ...defaults, ...(JSON.parse(row.json) as Partial<T>) };
  } catch {
    // Banco indisponível ou JSON inválido — usa os padrões.
    return defaults;
  }
}

export async function saveContent(key: string, data: object) {
  const json = JSON.stringify(data);
  await prisma.contentBlock.upsert({
    where: { key },
    update: { json },
    create: { key, json },
  });
}
