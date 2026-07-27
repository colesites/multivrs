/**
 * Artifact storage seam — the "upload" stage of the deploy loop.
 *
 * Blobs are content-addressed (keyed by sha256), so `put` is idempotent and
 * unchanged files across deploys dedupe for free. In production this is
 * **Cloudflare R2** (ARCHITECTURE.md §1/§10): an `R2ArtifactStore` implements
 * the same interface over the S3-compatible API. `LocalArtifactStore` is the
 * filesystem implementation used for dev + tests (no cloud creds required).
 */
import { promises as fs } from "node:fs";
import { join } from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import type { Artifact } from "./artifact";

export interface ArtifactStore {
  has(hash: string): Promise<boolean>;
  put(hash: string, contents: Uint8Array): Promise<void>;
  get(hash: string): Promise<Uint8Array | null>;
  delete(hash: string): Promise<void>;
  putManifest(artifact: Artifact): Promise<void>;
  getManifest(hash: string): Promise<Artifact | null>;
  deleteManifest(hash: string): Promise<void>;
}

export class LocalArtifactStore implements ArtifactStore {
  private readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  private blobPath(hash: string): string {
    return join(this.root, "blobs", hash);
  }

  private manifestPath(hash: string): string {
    return join(this.root, "artifacts", hash, "manifest.json");
  }

  async has(hash: string): Promise<boolean> {
    try {
      await fs.access(this.blobPath(hash));
      return true;
    } catch {
      return false;
    }
  }

  async put(hash: string, contents: Uint8Array): Promise<void> {
    await fs.mkdir(join(this.root, "blobs"), { recursive: true });
    if (await this.has(hash)) {
      return;
    }
    await fs.writeFile(this.blobPath(hash), contents);
  }

  async get(hash: string): Promise<Uint8Array | null> {
    try {
      return await fs.readFile(this.blobPath(hash));
    } catch {
      return null;
    }
  }

  async delete(hash: string): Promise<void> {
    await fs.rm(this.blobPath(hash), { force: true });
  }

  async putManifest(artifact: Artifact): Promise<void> {
    const path = this.manifestPath(artifact.hash);
    await fs.mkdir(join(this.root, "artifacts", artifact.hash), {
      recursive: true,
    });
    await fs.writeFile(path, JSON.stringify(artifact, null, 2));
  }

  async getManifest(hash: string): Promise<Artifact | null> {
    try {
      return JSON.parse(await fs.readFile(this.manifestPath(hash), "utf8")) as Artifact;
    } catch {
      return null;
    }
  }

  async deleteManifest(hash: string): Promise<void> {
    await fs.rm(this.manifestPath(hash), { force: true });
  }
}

export interface R2ArtifactStoreOptions {
  bucket: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

async function streamToBytes(body: unknown): Promise<Uint8Array> {
  if (!body) {
    return new Uint8Array();
  }
  if (body instanceof Uint8Array) {
    return body;
  }
  if (typeof (body as { transformToByteArray?: unknown }).transformToByteArray === "function") {
    return (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array | Buffer | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export class R2ArtifactStore implements ArtifactStore {
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor(options: R2ArtifactStoreOptions) {
    this.bucket = options.bucket;
    const config: S3ClientConfig = {
      region: options.region ?? "auto",
      endpoint: options.endpoint,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      forcePathStyle: true,
    };
    this.client = new S3Client(config);
  }

  private blobKey(hash: string): string {
    return `blobs/${hash}`;
  }

  private manifestKey(hash: string): string {
    return `artifacts/${hash}/manifest.json`;
  }

  async has(hash: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: this.blobKey(hash),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async put(hash: string, contents: Uint8Array): Promise<void> {
    if (await this.has(hash)) {
      return;
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.blobKey(hash),
        Body: contents,
      }),
    );
  }

  async get(hash: string): Promise<Uint8Array | null> {
    try {
      const object = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.blobKey(hash),
        }),
      );
      return streamToBytes(object.Body);
    } catch {
      return null;
    }
  }

  async delete(hash: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: this.blobKey(hash) }),
    );
  }

  async putManifest(artifact: Artifact): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.manifestKey(artifact.hash),
        Body: JSON.stringify(artifact),
        ContentType: "application/json",
      }),
    );
  }

  async getManifest(hash: string): Promise<Artifact | null> {
    try {
      const object = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.manifestKey(hash),
        }),
      );
      return JSON.parse(Buffer.from(await streamToBytes(object.Body)).toString("utf8")) as Artifact;
    } catch {
      return null;
    }
  }

  async deleteManifest(hash: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: this.manifestKey(hash) }),
    );
  }
}

export interface UploadResult {
  uploaded: number;
  skipped: number;
}

/** Upload every file of an artifact, deduping blobs already in the store. */
export async function uploadArtifact(
  store: ArtifactStore,
  sourceDir: string,
  artifact: Artifact,
): Promise<UploadResult> {
  let uploaded = 0;
  let skipped = 0;
  for (const file of artifact.files) {
    if (await store.has(file.hash)) {
      skipped++;
      continue;
    }
    const bytes = await fs.readFile(join(/* turbopackIgnore: true */ sourceDir, file.path));
    await store.put(file.hash, bytes);
    uploaded++;
  }
  await store.putManifest(artifact);
  return { uploaded, skipped };
}
