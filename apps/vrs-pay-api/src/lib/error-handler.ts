import { invalidRequest, isVrsPayError, VrsPayError } from "@vrs-pay/core";
import type { Context } from "hono";
import { z } from "zod";
import type { AppEnv } from "../app.types";

/** Normalizes anything thrown into a VrsPayError; internals never leak. */
function toVrsPayError(error: unknown): VrsPayError {
  if (isVrsPayError(error)) return error;
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    const param = issue?.path.map(String).join(".") || undefined;
    return invalidRequest("parameter_invalid", issue?.message ?? "Invalid request.", param);
  }
  return new VrsPayError({
    type: "api_error",
    code: "internal_error",
    message: "Something went wrong on our side. Retrying is safe with an Idempotency-Key.",
    status: 500,
  });
}

/** Renders every error as `{ error: { type, code, message, param, request_id } }`. */
export function errorHandler(error: Error, c: Context<AppEnv>): Response {
  const vrsError = toVrsPayError(error);
  return Response.json(
    {
      error: {
        type: vrsError.type,
        code: vrsError.code,
        message: vrsError.message,
        param: vrsError.param ?? null,
        request_id: c.get("requestId") ?? null,
        ...(vrsError.details ? { details: vrsError.details } : {}),
      },
    },
    { status: vrsError.status },
  );
}
