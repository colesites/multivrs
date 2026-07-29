import { UnauthorizedError, ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { resolveHostname } from "@/lib/services/serve.service";


function authorize(request: Request): void {
  const expected = process.env.MULTIVRS_SERVE_TOKEN;
  if (
    expected &&
    request.headers.get("authorization") !== `Bearer ${expected}`
  ) {
    throw new UnauthorizedError("Invalid serve-worker token");
  }
}

export async function GET(request: Request) {
  try {
    authorize(request);
    const hostname = new URL(request.url).searchParams.get("hostname");
    if (!hostname) {
      throw new ValidationError("hostname is required");
    }
    return ok(await resolveHostname(hostname));
  } catch (error) {
    return fail(error);
  }
}
