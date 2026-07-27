import { serveDeployment } from "./serve";
import { recordRequest } from "./telemetry";
import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    const startedAt = Date.now();
    try {
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
} satisfies ExportedHandler<Env>;
