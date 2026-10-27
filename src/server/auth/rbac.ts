import { ORG_ROLES, type OrgRole } from "../db/models/membership";
import type { SystemRole } from "../db/models/user";
import { AppError, forbidden } from "../errors";

/** The authenticated caller, resolved from a valid session on every request. */
export type AuthContext = {
  userId: string;
  name: string;
  email: string;
  systemRole: SystemRole;
  organizationId: string;
  organizationName: string;
  organizationStatus: "active" | "suspended";
  role: OrgRole;
  sessionId: string;
};

export function hasOrgRole(actual: OrgRole, minimum: OrgRole): boolean {
  return ORG_ROLES.indexOf(actual) >= ORG_ROLES.indexOf(minimum);
}

export function requireOrgRole(ctx: AuthContext, minimum: OrgRole): void {
  if (!hasOrgRole(ctx.role, minimum)) {
    throw forbidden(`This action requires the ${minimum} role or higher in this organization.`);
  }
}

/** Members of a suspended organization keep read access but cannot change data. */
export function requireActiveOrganization(ctx: AuthContext): void {
  if (ctx.organizationStatus !== "active") {
    throw new AppError("ACCOUNT_SUSPENDED", "This organization is suspended. Contact support.");
  }
}

export function requireSystemAdmin(ctx: AuthContext): void {
  if (ctx.systemRole !== "admin") throw forbidden("Administrator access required.");
}
