import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// Criptografia (AES-256-GCM) dos segredos salvos pelo painel: chaves dos gateways de
// pagamento (Mercado Pago, Stripe, Cielo) e chave de IA. SETTINGS_ENCRYPTION_KEY pode ser
// qualquer string forte — scryptSync deriva a chave de 32 bytes.
const KEY_DERIVATION_SALT = "ciranda-settings-salt-v1";
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("SETTINGS_ENCRYPTION_KEY não configurada — necessária para salvar/ler chaves.");
  }
  return scryptSync(secret, KEY_DERIVATION_SALT, 32);
}

export type EncryptedValue = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export function encrypt(plaintext: string): EncryptedValue {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decrypt({ ciphertext, iv, authTag }: EncryptedValue): string {
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

// Últimos 4 caracteres, para o admin confirmar qual chave está salva sem reexibir o valor.
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 4) return "••••";
  return `••••${plaintext.slice(-4)}`;
}
