import "server-only";
import { LocalArtifactStore, R2ArtifactStore, type ArtifactStore } from "@multivrs/build-utils";
import { join } from "node:path";

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
        join(process.cwd(), ".multivrs", "artifacts"),
    );
  }

  return new R2ArtifactStore({
    bucket: requireEnv("R2_BUCKET_NAME"),
    endpoint: requireEnv("R2_ENDPOINT"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  });
}
