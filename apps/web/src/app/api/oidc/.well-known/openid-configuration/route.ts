import { fail, ok } from "@/lib/api/respond";
import { oidcConfiguration } from "@/lib/services/oidc.service";

export async function GET() {
  try {
    return ok(oidcConfiguration());
  } catch (error) {
    return fail(error);
  }
}
