/**
 * Phase 0 feature test — @multivrs/error-utils.
 * Asserts the error→HTTP mapping the API and client both rely on.
 */
import { describe, expect, test } from "bun:test";
import {
  ConflictError,
  isMultivrsError,
  NotFoundError,
  toErrorResponse,
  UnauthorizedError,
  ValidationError,
} from "@multivrs/error-utils";

describe("@multivrs/error-utils", () => {
  test("each error carries its code + HTTP status", () => {
    expect(new ValidationError().statusCode).toBe(422);
    expect(new ValidationError().code).toBe("validation_error");
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new ConflictError().code).toBe("conflict");
  });

  test("toErrorResponse maps a known error to body + status", () => {
    const res = toErrorResponse(new NotFoundError("nope"));
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
    expect(res.body.error.message).toBe("nope");
  });

  test("toErrorResponse hides unknown errors behind a generic 500", () => {
    const res = toErrorResponse(new Error("internal secret detail"));
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("internal_error");
    expect(res.body.error.message).not.toContain("secret");
  });

  test("isMultivrsError narrows correctly", () => {
    expect(isMultivrsError(new ConflictError())).toBe(true);
    expect(isMultivrsError(new Error())).toBe(false);
  });
});
