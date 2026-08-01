import { NextRequest, NextResponse } from "next/server";
import { saveUpload } from "@/lib/uploads";

// Upload público da foto de referência do Ateliê (ex.: look de celebridade).
// Aceita somente imagens, até 8MB.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Envie uma imagem (JPG, PNG ou WEBP)." }, { status: 400 });
    }
    const url = await saveUpload(file, "referencias");
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
