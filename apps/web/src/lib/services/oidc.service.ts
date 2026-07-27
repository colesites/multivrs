import "server-only";
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  createSign,
  randomUUID,
} from "node:crypto";
import { MultivrsError } from "@multivrs/error-utils";
import { getProject } from "@/lib/services/project.service";

function privateKey() {
  const raw = process.env.MULTIVRS_OIDC_PRIVATE_KEY;
  if (!raw)
    throw new MultivrsError(
      "internal_error",
      "MULTIVRS_OIDC_PRIVATE_KEY is not configured",
      503,
    );
  return createPrivateKey(raw.replaceAll("\\n", "\n"));
}

export function oidcConfigured(): boolean {
  return Boolean(
    process.env.MULTIVRS_OIDC_PRIVATE_KEY &&
      (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL),
  );
}

export function oidcIssuerOrStatus(): string {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
  return origin ? `${origin.replace(/\/$/, "")}/api/oidc` : "Not configured";
}

function issuer() {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
  if (!origin)
    throw new MultivrsError(
      "internal_error",
      "The public application URL is not configured",
      503,
    );
  return `${origin.replace(/\/$/, "")}/api/oidc`;
}

export function oidcConfiguration() {
  const base = issuer();
  return {
    id_token_signing_alg_values_supported: ["RS256"],
    issuer: base,
    jwks_uri: `${base}/jwks`,
    response_types_supported: ["id_token"],
    subject_types_supported: ["public"],
  };
}

export function oidcJwks() {
  const publicKey = createPublicKey(privateKey());
  const jwk = publicKey.export({ format: "jwk" });
  return {
    keys: [
      {
        ...jwk,
        alg: "RS256",
        kid: keyId(
          publicKey.export({ format: "pem", type: "spki" }).toString(),
        ),
        use: "sig",
      },
    ],
  };
}

export async function issueProjectOidcToken(
  userId: string,
  projectId: string,
  audience: string,
) {
  const project = await getProject(userId, projectId);
  const now = Math.floor(Date.now() / 1_000);
  const key = privateKey();
  const publicPem = createPublicKey(key)
    .export({ format: "pem", type: "spki" })
    .toString();
  const header = encode({ alg: "RS256", kid: keyId(publicPem), typ: "JWT" });
  const payload = encode({
    aud: audience,
    exp: now + 3_600,
    iat: now,
    iss: issuer(),
    jti: randomUUID(),
    owner_id: userId,
    project_id: project.id,
    project_slug: project.slug,
    sub: `project:${project.id}`,
  });
  const signingInput = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .end()
    .sign(key)
    .toString("base64url");
  return {
    expiresAt: new Date((now + 3_600) * 1_000).toISOString(),
    token: `${signingInput}.${signature}`,
  };
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function keyId(publicKey: string): string {
  return createHash("sha256")
    .update(publicKey)
    .digest("base64url")
    .slice(0, 16);
}
