import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { saveBase64Image } from "@/lib/uploads";

// Croqui do Ateliê gerado por IA (OpenAI Images). A chave é cadastrada no painel
// (Configurações → Inteligência artificial) e fica cifrada no banco.

export async function getOpenAiKey(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
  if (!setting?.openaiKeyCiphertext || !setting.openaiKeyIv || !setting.openaiKeyTag) return null;
  try {
    return decrypt({
      ciphertext: setting.openaiKeyCiphertext,
      iv: setting.openaiKeyIv,
      authTag: setting.openaiKeyTag,
    });
  } catch {
    return null;
  }
}

export async function isAiConfigured() {
  return (await getOpenAiKey()) !== null;
}

export async function generateSketchImage(description: string): Promise<string> {
  const apiKey = await getOpenAiKey();
  if (!apiKey) throw new Error("A geração por IA não está configurada.");

  const prompt = [
    "Croqui de moda (fashion sketch) elegante e minimalista de UMA peça de roupa infantil,",
    "estilo ilustração aquarela sobre papel marfim, traço fino, sem texto e sem marca d'água.",
    "A peça deve ser confortável e adequada para crianças, em tecidos macios.",
    `Descrição da peça: ${description}`,
  ].join(" ");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
      quality: "medium",
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof body?.error?.message === "string"
        ? body.error.message
        : "Não foi possível gerar o croqui agora.";
    throw new Error(message);
  }
  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) throw new Error("A IA não retornou uma imagem.");
  return saveBase64Image(b64, "ai", "croqui");
}
