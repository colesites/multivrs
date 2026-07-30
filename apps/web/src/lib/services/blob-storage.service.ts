import "server-only";
import { createHmac } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ConflictError,
  MultivrsError,
  NotFoundError,
  ValidationError,
} from "@multivrs/error-utils";
import type { z } from "zod";
import type { BlobData } from "@/features/dashboard/types/content-platform.types";
import { prisma } from "@/lib/prisma";
import type { prepareBlobUploadSchema } from "@/lib/schemas/content-platform.schemas";
import { getProject } from "@/lib/services/project.service";
import { deploymentUrl } from "@/lib/services/serve.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

type PrepareBlobInput = z.infer<typeof prepareBlobUploadSchema>;

function requireEnvironment(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value)
    throw new MultivrsError("internal_error", `${name} is required`, 503);
  return value;
}

function storage() {
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

function toBlobData(row: {
  contentType: string;
  createdAt: Date;
  id: string;
  pathname: string;
  size: bigint;
  status: string;
  visibility: string;
}): BlobData {
  return {
    contentType: row.contentType,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    pathname: row.pathname,
    size: Number(row.size),
    status: row.status as BlobData["status"],
    visibility: row.visibility as BlobData["visibility"],
  };
}

async function ownedBlob(
  userId: string,
  projectId: string,
  blobId: string,
  action: "read" | "update" = "read",
) {
  await getProject(userId, projectId, action);
  const row = await prisma.projectBlob.findFirst({
    where: { id: blobId, projectId },
  });
  if (!row) throw new NotFoundError("Blob not found");
  return row;
}

export async function listBlobs(
  userId: string,
  projectId: string,
): Promise<BlobData[]> {
  await getProject(userId, projectId);
  const rows = await prisma.projectBlob.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toBlobData);
}

export async function prepareBlobUpload(
  userId: string,
  projectId: string,
  input: PrepareBlobInput,
) {
  await getProject(userId, projectId, "update");
  const storageKey = `blobs/${projectId}/${input.pathname}`;
  const existing = await prisma.projectBlob.findUnique({
    where: { projectId_pathname: { pathname: input.pathname, projectId } },
  });
  if (existing?.status === "pending") {
    throw new ConflictError("An upload is already pending for this pathname");
  }
  const row = await prisma.projectBlob.upsert({
    where: { projectId_pathname: { pathname: input.pathname, projectId } },
    create: {
      contentType: input.contentType,
      pathname: input.pathname,
      projectId,
      size: input.size,
      storageKey,
      visibility: input.visibility,
    },
    update: {
      checksum: null,
      contentType: input.contentType,
      size: input.size,
      status: "pending",
      visibility: input.visibility,
    },
  });
  const { bucket, client } = storage();
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      ContentLength: input.size,
      ContentType: input.contentType,
      Key: storageKey,
      Metadata: { projectId, visibility: input.visibility },
    }),
    { expiresIn: 15 * 60 },
  );
  return {
    blob: toBlobData(row),
    expiresIn: 15 * 60,
    headers: { "content-type": input.contentType },
    uploadUrl,
  };
}

export async function completeBlobUpload(
  userId: string,
  projectId: string,
  blobId: string,
) {
  const row = await ownedBlob(userId, projectId, blobId, "update");
  const { bucket, client } = storage();
  const object = await client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: row.storageKey }),
  );
  const size = object.ContentLength ?? 0;
  if (size !== Number(row.size)) {
    await prisma.projectBlob.update({
      where: { id: row.id },
      data: { status: "failed" },
    });
    throw new ValidationError(
      "Uploaded object size does not match the prepared upload",
    );
  }
  const updated = await prisma.projectBlob.update({
    where: { id: row.id },
    data: {
      checksum:
        object.ChecksumSHA256 ?? object.ETag?.replaceAll('"', "") ?? null,
      contentType: object.ContentType ?? row.contentType,
      status: "ready",
    },
  });
  await recordUsageEvent(userId, projectId, "blob_advanced_operations");
  return toBlobData(updated);
}

function edgePath(pathname: string): string {
  return pathname
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function signPrivateBlob(
  projectId: string,
  pathname: string,
  expires: number,
): string {
  const secret = requireEnvironment("MULTIVRS_BLOB_SIGNING_SECRET");
  return createHmac("sha256", secret)
    .update(`${projectId}:${pathname}:${expires}`)
    .digest("hex");
}

export async function getBlobAccess(
  userId: string,
  projectId: string,
  blobId: string,
) {
  const blob = await ownedBlob(userId, projectId, blobId);
  if (blob.status !== "ready")
    throw new ConflictError("Blob upload is not complete");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { productionDeployment: { select: { id: true, url: true } } },
  });
  const baseUrl = project?.productionDeployment
    ? (project.productionDeployment.url ??
      deploymentUrl(project.productionDeployment.id))
    : null;
  let edgeUrl: string | null = null;
  if (baseUrl && !baseUrl.startsWith("/")) {
    const url = new URL(`/_multivrs/blob/${edgePath(blob.pathname)}`, baseUrl);
    if (blob.visibility === "private") {
      const expires = Math.floor(Date.now() / 1000) + 15 * 60;
      url.searchParams.set("expires", String(expires));
      url.searchParams.set(
        "signature",
        signPrivateBlob(projectId, blob.pathname, expires),
      );
    }
    edgeUrl = url.toString();
  }
  const { bucket, client } = storage();
  const downloadUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: blob.storageKey }),
    { expiresIn: 15 * 60 },
  );
  return { blob: toBlobData(blob), downloadUrl, edgeUrl, expiresIn: 15 * 60 };
}

export async function deleteBlob(
  userId: string,
  projectId: string,
  blobId: string,
): Promise<void> {
  const blob = await ownedBlob(userId, projectId, blobId, "update");
  const { bucket, client } = storage();
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: blob.storageKey }),
  );
  await prisma.projectBlob.delete({ where: { id: blob.id } });
  await recordUsageEvent(userId, projectId, "blob_advanced_operations");
}
