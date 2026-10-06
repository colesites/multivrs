import { isVrsPayError, type VrsPayError } from "@vrs-pay/core";

/** Runs `fn` and returns the VrsPayError it throws (fails the test otherwise). */
export function thrown(fn: () => unknown): VrsPayError {
  try {
    fn();
  } catch (error) {
    if (isVrsPayError(error)) return error;
    throw error;
  }
  throw new Error("expected a VrsPayError to be thrown");
}
