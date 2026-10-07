import { createDb, type Db, databaseUrl } from "../db/client";

/** The database every merchant script needs. */
export function scriptContext(env: Record<string, string | undefined>) {
  const url = databaseUrl(env);
  if (!url) throw new Error("Set DATABASE_URL or DIRECT_URL in .env.local.");
  return { db: createDb(url) };
}

export function print(lines: Record<string, string>): void {
  const width = Math.max(...Object.keys(lines).map((label) => label.length));
  for (const [label, value] of Object.entries(lines)) {
    process.stdout.write(`${label.padEnd(width)}  ${value}\n`);
  }
}

export async function finish(db: Db, run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } finally {
    await db.$disconnect();
  }
}
