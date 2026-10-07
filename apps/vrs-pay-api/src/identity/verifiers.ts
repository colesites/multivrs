import type { IdentityVerifier } from "./identity.types";

/** Sandbox numbers: this one always fails, so the failure path can be tested. */
export const SANDBOX_FAILING_NUMBER = "00000000000";

/**
 * Test mode: any well-formed number passes (except the sandbox failing
 * one). Nothing is sent anywhere.
 */
export const sandboxVerifier: IdentityVerifier = {
  async verify({ idNumber }) {
    if (idNumber === SANDBOX_FAILING_NUMBER) {
      return { status: "failed", reason: "The name and date of birth don't match this ID." };
    }
    return { status: "verified" };
  },
};

/** Live mode without an identity provider configured: queue it for our team. */
export const manualVerifier: IdentityVerifier = {
  async verify() {
    return { status: "pending", reason: "We're checking your ID — usually within 1 business day." };
  },
};
