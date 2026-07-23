import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { domainSearchResultSchema } from "@/features/domains/domain-commerce.schemas";
import { auth } from "@/lib/auth";
import {
  listSavedDomains,
  removeSavedDomain,
  saveDomain,
} from "@/lib/services/saved-domain.service";

const removeSavedDomainSchema = z.object({
  hostname: z.string().trim().min(3).max(253),
});

export async function GET() {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();
  return NextResponse.json({ domains: await listSavedDomains(userId) });
}

export async function POST(request: Request) {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();
  const parsed = domainSearchResultSchema.safeParse(await readJson(request));
  if (!parsed.success || !parsed.data.available) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }
  await saveDomain(userId, parsed.data);
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();
  const parsed = removeSavedDomainSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }
  await removeSavedDomain(userId, parsed.data.hostname);
  return NextResponse.json({ removed: true });
}

async function authenticatedUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 },
  );
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
