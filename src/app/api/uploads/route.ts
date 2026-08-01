import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";

// Upload do painel administrativo (imagens de produto, logo, conteúdo).
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
    }
    const url = await saveUpload(file, "media");
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Falha no upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
