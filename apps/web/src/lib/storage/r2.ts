import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { MultivrsError } from "@multivrs/error-utils";

function requireEnvironment(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value)
    throw new MultivrsError("internal_error", `${name} is required`, 503);
  return value;
}

/** The R2 bucket that holds uploaded content, and an S3 client for it. */
export function r2Storage() {
  const bucket = requireEnvironment(
    "R2_CONTENT_BUCKET_NAME",
    process.env.R2_BUCKET_NAME,
  );
  const client = new S3Client({
    credentials: {
      accessKeyId: requireEnvironment("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnvironment("R2_SECRET_ACCESS_KEY"),
    },
    endpoint: requireEnvironment("R2_ENDPOINT"),
    forcePathStyle: true,
    region: "auto",
  });
  return { bucket, client };
}
