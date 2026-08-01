import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

// 4MB: dentro do limite de request da Vercel (4,5MB) e suficiente para fotos de produto.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// Com BLOB_READ_WRITE_TOKEN configurado (Vercel Blob), os arquivos vão para o Blob —
// obrigatório em produção na Vercel, onde o disco não persiste. Sem o token (dev local),
// salva em public/uploads/.
function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function safeFilename(originalName: string, ext: string) {
  const base = path.basename(originalName, path.extname(originalName));
  const safe =
    base
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-_]+/g, "-")
      .slice(0, 48) || "arquivo";
  return `${Date.now()}-${safe}${ext}`;
}

export async function saveUpload(file: File, subfolder: "media" | "referencias" | "ai") {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Formato não suportado — envie JPG, PNG, WEBP ou SVG.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Arquivo muito grande (máx. 4MB).");

  const filename = safeFilename(file.name, ext);

  if (useBlob()) {
    const blob = await put(`uploads/${subfolder}/${filename}`, file, { access: "public" });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${subfolder}/${filename}`;
}

export async function saveBase64Image(b64: string, subfolder: "ai", name: string) {
  const filename = `${Date.now()}-${name}.png`;
  const buffer = Buffer.from(b64, "base64");

  if (useBlob()) {
    const blob = await put(`uploads/${subfolder}/${filename}`, buffer, {
      access: "public",
      contentType: "image/png",
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subfolder}/${filename}`;
}
