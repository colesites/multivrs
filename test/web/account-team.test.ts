/**
 * web — an account's team: slugs for new teams, which old workspaces can
 * become your team, and the role a team member gets on your projects.
 */
import { describe, expect, test } from "bun:test";
import {
  adoptionBlocker,
  teamSlugBase,
  teamSlugCandidates,
} from "../../apps/web/src/lib/services/account-team.helpers";
import { projectRole } from "../../apps/web/src/lib/services/project-access";

describe("team slugs", () => {
  test("come from the account name, with fallbacks when taken", () => {
    expect(teamSlugBase("colesites")).toBe("colesites");
    expect(teamSlugBase("Cole Sites!")).toBe("cole-sites");
    expect(teamSlugBase("!!!")).toBe("team");
    expect(teamSlugCandidates("cole", 2)).toEqual(["cole", "cole-team", "cole-2", "cole-3"]);
  });
});

describe("making an old workspace your team", () => {
  const empty = { accountOwnerId: null, projects: 0, subscriptions: 0, role: "owner" };

  test("works for an empty workspace you own", () => {
    expect(adoptionBlocker(empty)).toBeNull();
  });

  test("isn't allowed for someone else's, one with projects or a plan, or a team", () => {
    expect(adoptionBlocker({ ...empty, role: "admin" })).toContain("owner");
    expect(adoptionBlocker({ ...empty, projects: 1 })).toContain("projects");
    expect(adoptionBlocker({ ...empty, subscriptions: 1 })).toContain("plan");
    expect(adoptionBlocker({ ...empty, accountOwnerId: "user_1" })).toContain("already");
  });
});

describe("a member's role on a project", () => {
  const owner = (role?: string) => ({
    accountTeam: role === undefined ? null : { members: role ? [{ role }] : [] },
  });

  test("comes from the owner's team for a personal project", () => {
    const project = { organizationId: null, organization: null, owner: owner("developer") };
    expect(projectRole(project)).toBe("developer");
    expect(projectRole({ ...project, owner: owner("") })).toBeUndefined();
    expect(projectRole({ ...project, owner: owner() })).toBeUndefined();
  });

  test("comes from the workspace for a workspace project, not the owner's team", () => {
    const project = {
      organizationId: "org_1",
      organization: { members: [{ role: "viewer" }] },
      owner: owner("admin"),
    };
    expect(projectRole(project)).toBe("viewer");
    expect(projectRole({ ...project, organization: { members: [] } })).toBeUndefined();
  });
});
