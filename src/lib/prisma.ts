import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

// Dev: SQLite local (file:./prisma/dev.db). Produção: aponte DATABASE_URL para um
// Postgres (e troque o provider no schema.prisma) — o adapter certo é escolhido pela URL.
const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

function createAdapter() {
  if (url.startsWith("postgres")) {
    return new PrismaPg({ connectionString: url });
  }
  return new PrismaBetterSqlite3({ url });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
