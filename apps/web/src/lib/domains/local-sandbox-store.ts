import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { dnsRecordInputSchema } from "@/lib/domains/dns.schemas";

const registrationSchema = z.object({
  id: z.number(),
  hostname: z.string(),
  status: z.string(),
});
const zoneSchema = z.object({
  hostname: z.string(),
  records: z.array(dnsRecordInputSchema),
});
const stateSchema = z.object({
  nextId: z.number().int().positive().default(1),
  registrations: z.array(registrationSchema).default([]),
  zones: z.array(zoneSchema).default([]),
});

export type LocalSandboxState = z.infer<typeof stateSchema>;
let mutationQueue: Promise<void> = Promise.resolve();

export async function readLocalSandbox(): Promise<LocalSandboxState> {
  try {
    return stateSchema.parse(JSON.parse(await readFile(storePath(), "utf8")));
  } catch (error) {
    if (isMissingFile(error)) return emptyState();
    throw error;
  }
}

export function mutateLocalSandbox(
  mutation: (state: LocalSandboxState) => void,
): Promise<void> {
  const next = mutationQueue.then(async () => {
    const state = await readLocalSandbox();
    mutation(state);
    const destination = storePath();
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, JSON.stringify(state, null, 2), "utf8");
  });
  mutationQueue = next.catch(() => undefined);
  return next;
}

function storePath(): string {
  return path.join(process.cwd(), ".sandbox", "openprovider.json");
}

function emptyState(): LocalSandboxState {
  return { nextId: 1, registrations: [], zones: [] };
}

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
