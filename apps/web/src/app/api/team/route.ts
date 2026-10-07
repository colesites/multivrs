/**
 * /api/team — your account's team.
 *   GET  → your team (null until you invite someone), teams you're on, and
 *          older workspaces that could become your team
 *   POST → create your team if it doesn't exist yet
 */
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  ensureAccountTeam,
  findAccountTeam,
  otherWorkspaces,
  teamsJoined,
} from "@/lib/services/account-team.service";

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
