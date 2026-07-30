import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  billing: ["read", "manage"],
  deployment: ["create", "read", "promote", "rollback"],
  logs: ["read", "drain"],
  member: ["invite", "read", "update", "remove"],
  project: ["create", "read", "update", "delete"],
  security: ["read", "manage"],
} as const;

export const organizationAccess = createAccessControl(statement);

export const organizationRoles = {
  owner: organizationAccess.newRole({
    billing: ["read", "manage"],
    deployment: ["create", "read", "promote", "rollback"],
    logs: ["read", "drain"],
    member: ["invite", "read", "update", "remove"],
    project: ["create", "read", "update", "delete"],
    security: ["read", "manage"],
  }),
  admin: organizationAccess.newRole({
    billing: ["read"],
    deployment: ["create", "read", "promote", "rollback"],
    logs: ["read", "drain"],
    member: ["invite", "read", "update", "remove"],
    project: ["create", "read", "update", "delete"],
    security: ["read"],
  }),
  developer: organizationAccess.newRole({
    deployment: ["create", "read", "promote", "rollback"],
    logs: ["read"],
    member: ["read"],
    project: ["create", "read", "update"],
    security: ["read"],
  }),
  viewer: organizationAccess.newRole({
    deployment: ["read"],
    logs: ["read"],
    member: ["read"],
    project: ["read"],
    security: ["read"],
  }),
  billing: organizationAccess.newRole({
    billing: ["read", "manage"],
    member: ["read"],
    project: ["read"],
  }),
};
