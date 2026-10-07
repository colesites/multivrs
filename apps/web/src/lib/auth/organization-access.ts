import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Better Auth checks its own statements before inviting, removing members
 * or changing the workspace (e.g. `invitation: ["create"]`), so custom
 * access control has to keep them. Without them every role, owners
 * included, gets "You are not allowed to invite users to this organization".
 */
const statement = {
  ...defaultStatements,
  billing: ["read", "manage"],
  deployment: ["create", "read", "promote", "rollback"],
  logs: ["read", "drain"],
  member: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  security: ["read", "manage"],
} as const;

export const organizationAccess = createAccessControl(statement);

export const organizationRoles = {
  owner: organizationAccess.newRole({
    ...ownerAc.statements,
    billing: ["read", "manage"],
    deployment: ["create", "read", "promote", "rollback"],
    logs: ["read", "drain"],
    member: ["create", "read", "update", "delete"],
    project: ["create", "read", "update", "delete"],
    security: ["read", "manage"],
  }),
  admin: organizationAccess.newRole({
    ...adminAc.statements,
    billing: ["read"],
    deployment: ["create", "read", "promote", "rollback"],
    logs: ["read", "drain"],
    member: ["create", "read", "update", "delete"],
    project: ["create", "read", "update", "delete"],
    security: ["read"],
  }),
  developer: organizationAccess.newRole({
    ...memberAc.statements,
    deployment: ["create", "read", "promote", "rollback"],
    logs: ["read"],
    member: ["read"],
    project: ["create", "read", "update"],
    security: ["read"],
  }),
  viewer: organizationAccess.newRole({
    ...memberAc.statements,
    deployment: ["read"],
    logs: ["read"],
    member: ["read"],
    project: ["read"],
    security: ["read"],
  }),
  billing: organizationAccess.newRole({
    ...memberAc.statements,
    billing: ["read", "manage"],
    member: ["read"],
    project: ["read"],
  }),
};
