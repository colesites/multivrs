/**
 * web — workspace roles keep Better Auth's own permissions, so owners and
 * admins can invite and remove members; everyone else can't.
 */
import { describe, expect, test } from "bun:test";
import { organizationRoles } from "../../apps/web/src/lib/auth/organization-access";

const can = (role: keyof typeof organizationRoles, request: Record<string, string[]>) =>
  organizationRoles[role].authorize(request).success;

describe("workspace roles", () => {
  test("owners and admins can invite, cancel invitations and manage members", () => {
    for (const role of ["owner", "admin"] as const) {
      expect(can(role, { invitation: ["create", "cancel"] })).toBe(true);
      expect(can(role, { member: ["create", "update", "delete"] })).toBe(true);
      expect(can(role, { organization: ["update"] })).toBe(true);
    }
    expect(can("owner", { organization: ["delete"] })).toBe(true);
    expect(can("admin", { organization: ["delete"] })).toBe(false);
  });

  test("developers, viewers and billing can't invite or remove anyone", () => {
    for (const role of ["developer", "viewer", "billing"] as const) {
      expect(can(role, { invitation: ["create"] })).toBe(false);
      expect(can(role, { member: ["delete"] })).toBe(false);
      expect(can(role, { member: ["read"] })).toBe(true);
    }
  });

  test("the app's own permissions are unchanged", () => {
    expect(can("developer", { deployment: ["promote"] })).toBe(true);
    expect(can("viewer", { deployment: ["create"] })).toBe(false);
    expect(can("billing", { billing: ["manage"] })).toBe(true);
    expect(can("admin", { billing: ["manage"] })).toBe(false);
  });
});
