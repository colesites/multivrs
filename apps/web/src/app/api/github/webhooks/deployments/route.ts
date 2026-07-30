import { ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import {
  processGitHubDeploymentWebhook,
  verifyGitHubWebhook,
} from "@/lib/services/github-webhook.service";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    verifyGitHubWebhook(body, request.headers.get("x-hub-signature-256"));
    const deliveryId = request.headers.get("x-github-delivery");
    const event = request.headers.get("x-github-event");
    if (!deliveryId || !event)
      throw new ValidationError("GitHub webhook headers are missing");
    return ok(
      await processGitHubDeploymentWebhook({
        apiUrl: new URL(request.url).origin,
        body: JSON.parse(body),
        deliveryId,
        event,
      }),
      202,
    );
  } catch (error) {
    return fail(error);
  }
}
