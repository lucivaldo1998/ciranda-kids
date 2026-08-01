// Cria as tabelas no Postgres SEM depender do Prisma CLI — útil localmente.
// Em produção (Vercel), prefira a rota /api/admin/bootstrap?senha=SUA_SENHA
// Rode com: npm run db:init
import "dotenv/config";
import { Pool } from "pg";
import { PG_DDL } from "../src/lib/db-ddl";

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error("Configure DATABASE_URL com a URL do Postgres (Supabase) no arquivo .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
pool
  .query(PG_DDL)
  .then(() => console.log("Tabelas criadas/conferidas com sucesso."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
