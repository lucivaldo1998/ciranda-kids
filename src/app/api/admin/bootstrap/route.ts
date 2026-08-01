import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth";
import { ensureSchema, seedDefaults } from "@/lib/db-bootstrap";

// Prepara o banco em produção SEM precisar de comandos locais:
// depois do deploy, acesse  https://SEU-DOMINIO/api/admin/bootstrap?senha=SUA_SENHA_ADMIN
// (idempotente: cria as tabelas se faltarem e os dados iniciais se o catálogo estiver vazio).
async function handle(request: NextRequest) {
  const senha =
    request.nextUrl.searchParams.get("senha") ??
    (await request.json().catch(() => null))?.senha ??
    "";
  if (!(await verifyAdminPassword(String(senha)))) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.startsWith("postgres")) {
    return NextResponse.json(
      { error: "DATABASE_URL não aponta para um Postgres — configure a URL do Supabase." },
      { status: 400 }
    );
  }

  try {
    await ensureSchema(databaseUrl);
    const seeded = await seedDefaults();
    return NextResponse.json({
      ok: true,
      mensagem: "Banco pronto! Tabelas criadas/conferidas e dados iniciais no lugar.",
      ...seeded,
      proximoPasso: "Acesse /admin para configurar marca, produtos e pagamentos.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar o banco.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
