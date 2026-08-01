import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import type { GatewayId, PublicGatewayInfo, ResolvedGatewayConfig } from "./types";
import { GATEWAY_IDS } from "./types";

function safeDecrypt(ciphertext: string | null, iv: string | null, authTag: string | null) {
  if (!ciphertext || !iv || !authTag) return null;
  try {
    return decrypt({ ciphertext, iv, authTag });
  } catch {
    return null;
  }
}

export async function getGatewayConfig(id: GatewayId): Promise<ResolvedGatewayConfig | null> {
  const row = await prisma.paymentGateway.findUnique({ where: { id } });
  if (!row) return null;
  return {
    id,
    active: row.active,
    testMode: row.testMode,
    publicKey: row.publicKey,
    secret: safeDecrypt(row.secretCiphertext, row.secretIv, row.secretTag),
    webhookSecret: safeDecrypt(
      row.webhookSecretCiphertext,
      row.webhookSecretIv,
      row.webhookSecretTag
    ),
  };
}

// Lista para o checkout: apenas gateways ativos e com credenciais mínimas preenchidas.
export async function listActiveGateways(): Promise<PublicGatewayInfo[]> {
  let rows;
  try {
    rows = await prisma.paymentGateway.findMany({ where: { active: true } });
  } catch {
    return [];
  }
  const result: PublicGatewayInfo[] = [];
  for (const row of rows) {
    if (!GATEWAY_IDS.includes(row.id as GatewayId)) continue;
    const hasSecret = Boolean(row.secretCiphertext);
    const hasPublic = Boolean(row.publicKey);
    if (row.id === "cielo" ? hasSecret && hasPublic : hasSecret) {
      result.push({ id: row.id as GatewayId, testMode: row.testMode });
    }
  }
  return result;
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
