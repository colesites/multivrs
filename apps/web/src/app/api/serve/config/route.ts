import { UnauthorizedError, ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { getRuntimeProjectConfig } from "@/lib/services/content-platform.service";

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
    if (!projectId) throw new ValidationError("projectId is required");
    return ok(
      await getRuntimeProjectConfig(
        projectId,
        search.get("version") ?? undefined,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
