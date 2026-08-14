// Keep Prisma CLI commands on the same local database branch that Next.js uses.
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: [".env.local", ".env"], override: false, quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL (unpooled direct connection) for migrations to avoid
    // advisory lock timeouts on Neon transaction poolers.
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
