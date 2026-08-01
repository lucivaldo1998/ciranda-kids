"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { GATEWAY_IDS, type GatewayId } from "@/lib/payments/types";

export async function saveGatewayAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "") as GatewayId;
  if (!GATEWAY_IDS.includes(id)) throw new Error("Gateway inválido.");

  const active = formData.get("active") === "on";
  const testMode = formData.get("testMode") === "on";
  const publicKey = String(formData.get("publicKey") ?? "").trim();
  const secret = String(formData.get("secret") ?? "").trim();
  const webhookSecret = String(formData.get("webhookSecret") ?? "").trim();

  const data: Record<string, unknown> = {
    active,
    testMode,
    publicKey: publicKey || null,
  };

  // Segredos: só substitui se o campo veio preenchido (campo vazio = manter o atual).
  if (secret) {
    const enc = encrypt(secret);
    data.secretCiphertext = enc.ciphertext;
    data.secretIv = enc.iv;
    data.secretTag = enc.authTag;
  }
  if (webhookSecret) {
    const enc = encrypt(webhookSecret);
    data.webhookSecretCiphertext = enc.ciphertext;
    data.webhookSecretIv = enc.iv;
    data.webhookSecretTag = enc.authTag;
  }

  await prisma.paymentGateway.upsert({
    where: { id },
    update: data,
    create: { id, ...data },
  });

  revalidatePath("/admin/pagamentos");
}

export async function clearGatewaySecretsAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "") as GatewayId;
  if (!GATEWAY_IDS.includes(id)) throw new Error("Gateway inválido.");

  await prisma.paymentGateway.update({
    where: { id },
    data: {
      active: false,
      publicKey: null,
      secretCiphertext: null,
      secretIv: null,
      secretTag: null,
      webhookSecretCiphertext: null,
      webhookSecretIv: null,
      webhookSecretTag: null,
    },
  });

  revalidatePath("/admin/pagamentos");
}
