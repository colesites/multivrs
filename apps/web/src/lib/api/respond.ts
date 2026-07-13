/**
 * JSON response helpers. `fail` maps any thrown error to the platform's
 * `{ error: { code, message } }` body + correct status via @multivrs/error-utils.
 */
import { toErrorResponse } from "@multivrs/error-utils";
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function fail(err: unknown): NextResponse {
  const { status, body } = toErrorResponse(err);
  return NextResponse.json(body, { status });
}
