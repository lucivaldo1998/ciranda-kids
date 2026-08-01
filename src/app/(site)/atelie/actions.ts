"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { customOrderSchema } from "@/lib/validations";
import { generateSketchImage } from "@/lib/ai";

export type SubmitCustomOrderResult =
  | { ok: true; id: string; code: string }
  | { ok: false; message: string };

function newAtelierCode() {
  return `ATL-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function submitCustomOrder(input: unknown): Promise<SubmitCustomOrderResult> {
  const parsed = customOrderSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  if (data.type === "modelo" && !data.baseProductId) {
    return { ok: false, message: "Escolha a peça da coleção que servirá de base." };
  }
  if (data.type === "referencia" && !data.referenceImageUrl && !data.details) {
    return { ok: false, message: "Envie a foto de referência ou descreva a peça." };
  }
  if (data.type === "ia" && !data.aiPrompt && !data.details) {
    return { ok: false, message: "Descreva a peça que você quer criar." };
  }

  const created = await prisma.customOrder.create({
    data: {
      code: newAtelierCode(),
      type: data.type,
      baseProductId: data.baseProductId || null,
      referenceImageUrl: data.referenceImageUrl || null,
      aiPrompt: data.aiPrompt || null,
      aiImageUrl: data.aiImageUrl || null,
      fabric: data.fabric || null,
      colorNotes: data.colorNotes || null,
      details: data.details || null,
      measurementsJson: JSON.stringify(data.measurements ?? {}),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerCity: data.customerCity || null,
    },
  });

  return { ok: true, id: created.id, code: created.code };
}

export type GenerateSketchResult = { ok: true; url: string } | { ok: false; message: string };

export async function generateSketch(description: string): Promise<GenerateSketchResult> {
  const trimmed = description.trim();
  if (trimmed.length < 10) {
    return { ok: false, message: "Descreva a peça com um pouco mais de detalhe." };
  }
  try {
    const url = await generateSketchImage(trimmed.slice(0, 800));
    return { ok: true, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao gerar o croqui.";
    return { ok: false, message };
  }
}
