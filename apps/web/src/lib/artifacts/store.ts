import "server-only";
import { join } from "node:path";
import {
  type ArtifactStore,
  LocalArtifactStore,
  R2ArtifactStore,
} from "@multivrs/build-utils/store";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export function createArtifactStore(): ArtifactStore {
  if (process.env.MULTIVRS_ARTIFACT_STORE === "local") {
    return new LocalArtifactStore(
      process.env.MULTIVRS_LOCAL_ARTIFACT_DIR ??
        join(
          /* turbopackIgnore: true */ process.cwd(),
          ".multivrs",
          "artifacts",
        ),
    );
  }

  return new R2ArtifactStore({
    bucket: requireEnv("R2_BUCKET_NAME"),
    endpoint: requireEnv("R2_ENDPOINT"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  });
}
