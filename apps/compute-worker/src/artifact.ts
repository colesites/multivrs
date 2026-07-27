import { z } from "zod";
import type { Env } from "./types";

const manifestSchema = z.object({
  files: z
    .array(
      z.object({
        hash: z.string().regex(/^[a-f0-9]{64}$/),
        path: z.string().regex(/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$)).{1,500}$/),
      }),
    )
    .min(1)
    .max(20_000),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});

export async function loadArtifact(env: Env, artifactHash: string) {
  const object = await env.ARTIFACTS.get(`artifacts/${artifactHash}/manifest.json`);
  if (!object) throw new Error("Runtime manifest not found");
  const manifest = manifestSchema.parse(await object.json());
  if (manifest.hash !== artifactHash) throw new Error("Runtime manifest hash mismatch");
  return manifest;
}
