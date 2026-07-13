/**
 * Username derivation for OAuth sign-ups.
 *
 * Email/password users pick their own username at sign-up. OAuth users don't —
 * so we derive one from the provider profile (GitHub `login`, or the local part
 * of a Google email) and guarantee it's valid + unique. This runs only at
 * account creation (Better Auth doesn't override user info on later logins), so
 * a user's username is stable once assigned.
 */

import { prisma } from "@/lib/prisma";
import { RESERVED_USERNAMES } from "./plugins";

const MIN_LEN = 3;
const MAX_LEN = 30;

/**
 * Normalize an arbitrary string into a valid username base:
 * lowercase, only [a-z0-9_], and within length bounds. Falls back to "user"
 * if nothing usable remains, and pads short results so they clear MIN_LEN.
 */
function sanitizeBase(raw: string): string {
  let base = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_") // collapse invalid runs to a single underscore
    .replace(/^_+|_+$/g, "") // trim leading/trailing underscores
    .slice(0, MAX_LEN);

  if (base.length === 0) base = "user";
  while (base.length < MIN_LEN) base += "0";
  return base;
}

/** True if the slug is free (not reserved and not already taken). */
async function isAvailable(username: string): Promise<boolean> {
  if (RESERVED_USERNAMES.has(username)) return false;
  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !existing;
}

/**
 * Derive a unique, valid username from a provider-supplied string. Appends a
 * numeric suffix on collision (e.g. "ada", "ada2", "ada3", …), trimming the
 * base so the result never exceeds MAX_LEN.
 */
export async function generateUniqueUsername(raw: string): Promise<string> {
  const base = sanitizeBase(raw);

  if (await isAvailable(base)) return base;

  for (let n = 2; n < 10_000; n++) {
    const suffix = String(n);
    const candidate = `${base.slice(0, MAX_LEN - suffix.length)}${suffix}`;
    if (await isAvailable(candidate)) return candidate;
  }

  // Astronomically unlikely fallback: timestamp-based suffix.
  const suffix = Date.now().toString(36);
  return `${base.slice(0, MAX_LEN - suffix.length)}${suffix}`;
}
