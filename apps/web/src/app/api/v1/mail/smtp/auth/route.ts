import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { smtpAuthSchema } from "@/lib/schemas/mail-provider.schemas";
import { authenticateMailCredential } from "@/lib/services/mail-api-auth.service";

export async function POST(request: Request) {
  try {
    const credential = await authenticateMailCredential(request, "smtp");
    const { username } = await parseBody(request, smtpAuthSchema);
    if (username !== `mlv_${credential.id}`) throw new Error("Invalid SMTP username");
    return ok({ authorized: true });
  } catch (error) {
    return fail(error);
  }
}
