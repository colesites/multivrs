import { fail, ok } from "@/lib/api/respond";
import { oidcJwks } from "@/lib/services/oidc.service";

export async function GET() {
  try {
    return ok(oidcJwks());
  } catch (error) {
    return fail(error);
  }
}
