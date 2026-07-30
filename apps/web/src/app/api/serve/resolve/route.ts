import { UnauthorizedError, ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import {
  resolveHostname,
  resolveProjectId,
} from "@/lib/services/serve.service";

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
    const search = new URL(request.url).searchParams;
    const projectId = search.get("projectId");
    const hostname = search.get("hostname");
    if (projectId) return ok(await resolveProjectId(projectId));
    if (hostname) return ok(await resolveHostname(hostname));
    throw new ValidationError("hostname or projectId is required");
  } catch (error) {
    return fail(error);
  }
}
