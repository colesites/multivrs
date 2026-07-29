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
    // Neon supports Prisma migrations through its pooled endpoint. Keeping the
    // CLI on DATABASE_URL also prevents a stale DIRECT_URL from silently
    // targeting a deleted or unreachable compute endpoint.
    url: env("DATABASE_URL"),
  },
});
