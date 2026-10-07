import type { IdentityVerifier } from "./identity.types";

/** Sandbox numbers: this one always fails, so the failure path can be tested. */
export const SANDBOX_FAILING_NUMBER = "00000000000";

/**
 * Local development without a database: any well-formed number passes
 * (except the sandbox failing one). Nothing is sent anywhere. Servers with
 * a database use real providers only, because one ID check covers both
 * test and live mode.
 */
export const sandboxVerifier: IdentityVerifier = {
  async verify({ idNumber }) {
    if (idNumber === SANDBOX_FAILING_NUMBER) {
      return { status: "failed", reason: "The name and date of birth don't match this ID." };
    }
    return { status: "verified" };
  },
};
