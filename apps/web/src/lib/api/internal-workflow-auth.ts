import "server-only";
import { timingSafeEqual } from "node:crypto";
import { ConfigurationError, UnauthorizedError } from "@multivrs/error-utils";

export function requireInternalWorkflowRequest(request: Request): void {
  const expected = process.env.MULTIVRS_SERVE_TOKEN;
  if (!expected) {
    throw new ConfigurationError(
      "The workflow control plane token is not configured",
    );
  }
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!supplied) throw new UnauthorizedError();
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (
    expectedBytes.length !== suppliedBytes.length ||
    !timingSafeEqual(expectedBytes, suppliedBytes)
  ) {
    throw new UnauthorizedError();
  }
}
