/** Roles anyone can be invited as; only owners can hand out owner. */
export const INVITE_ROLES = [
  "admin",
  "developer",
  "viewer",
  "billing",
] as const;
/** Every workspace role, for changing a member's role. */
export const WORKSPACE_ROLES = ["owner", ...INVITE_ROLES] as const;

export type InviteRole = (typeof INVITE_ROLES)[number];
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export function isInviteRole(value: string): value is InviteRole {
  return INVITE_ROLES.some((role) => role === value);
}

export function isWorkspaceRole(value: string): value is WorkspaceRole {
  return WORKSPACE_ROLES.some((role) => role === value);
}
