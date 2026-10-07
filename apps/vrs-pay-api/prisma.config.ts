import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: [".env.local", ".env"], override: false, quiet: true });

// Migrations use DIRECT_URL (session pooler, port 5432): the transaction
// pooler can't hold the advisory lock `prisma migrate` takes. `prisma
// generate` needs no database, so a missing URL is fine there.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema",
  migrations: { path: "prisma/migrations" },
  ...(url ? { datasource: { url } } : {}),
});
