import "server-only";

function configuration(): {
  accountId: string;
  namespaceId: string;
  token: string;
} | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_RUNTIME_KV_NAMESPACE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  return accountId && namespaceId && token
    ? { accountId, namespaceId, token }
    : null;
}

export function runtimeConfigKey(projectId: string, version: string): string {
  return `project-config:${projectId}:${version}`;
}

export async function publishRuntimeConfig(
  projectId: string,
  version: string,
  value: unknown,
): Promise<boolean> {
  const config = configuration();
  if (!config) return false;
  const key = runtimeConfigKey(projectId, version);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.namespaceId}/values/${encodeURIComponent(key)}`,
    {
      body: JSON.stringify(value),
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      method: "PUT",
    },
  );
  if (!response.ok) {
    console.error(
      JSON.stringify({
        event: "runtime_config_publish_failed",
        projectId,
        status: response.status,
        version,
      }),
    );
    return false;
  }
  return true;
}
