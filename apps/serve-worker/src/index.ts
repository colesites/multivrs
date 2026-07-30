import { processRevalidation, serveDeployment } from "./serve";
import { recordRequest } from "./telemetry";
import type { Env, RevalidationMessage } from "./types";
import { dispatchScheduledWorkflows, handleWorkflowControl } from "./workflow-control";

export { CacheCoordinator } from "./cache-coordinator";
export { MultivrsWorkflow } from "./platform-workflow";

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    const startedAt = Date.now();
    try {
      const controlResponse = await handleWorkflowControl(request, env);
      if (controlResponse) return controlResponse;
      const served = await serveDeployment(request, env, context);
      if (served.analyticsEnabled) {
        recordRequest(
          env,
          request,
          served.projectId,
          served.deploymentId,
          served.response,
          Date.now() - startedAt,
        );
      }
      return served.response;
    } catch {
      const response = new Response("Deployment resolution failed", { status: 502 });
      recordRequest(env, request, "unresolved", "unresolved", response, Date.now() - startedAt);
      return response;
    }
  },
  async scheduled(_controller: ScheduledController, env: Env, context: ExecutionContext) {
    context.waitUntil(dispatchScheduledWorkflows(env));
  },
  async queue(
    batch: MessageBatch<RevalidationMessage>,
    env: Env,
    context: ExecutionContext,
  ): Promise<void> {
    for (const message of batch.messages) {
      try {
        await processRevalidation(message.body, env, context);
        message.ack();
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Worker logs are required for failed queue observability.
        console.error(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            event: "revalidation_failed",
            messageId: message.id,
            projectId: message.body.projectId,
          }),
        );
        message.retry({ delaySeconds: Math.min(300, 2 ** message.attempts) });
      }
    }
  },
} satisfies ExportedHandler<Env, RevalidationMessage>;
