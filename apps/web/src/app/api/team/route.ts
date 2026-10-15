/**
 * /api/team — your account's team.
 *   GET  → your team (null until you invite someone), teams you're on, and
 *          older workspaces that could become your team
 *   POST → create your team if it doesn't exist yet
 */
import { z } from "zod";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  ensureAccountTeam,
  findAccountTeam,
  otherWorkspaces,
  teamsJoined,
  updateAccountTeam,
} from "@/lib/services/account-team.service";

const updateTeamSchema = z.object({
  name: z.string().trim().min(1).max(32).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(48)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  logo: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const [team, joined, workspaces] = await Promise.all([
      findAccountTeam(userId),
      teamsJoined(userId),
      otherWorkspaces(userId),
    ]);
    return ok({ team, joined, workspaces });
  } catch (error) {
    return fail(error);
  }
}

export async function POST() {
  try {
    return ok(await ensureAccountTeam(await requireUserId()));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const body = updateTeamSchema.parse(await request.json());
    const updated = await updateAccountTeam(userId, body);
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
