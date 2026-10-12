import "server-only";
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { ValidationError } from "@multivrs/error-utils";
import { SITE_URL } from "@/lib/site";
import { r2Storage } from "@/lib/storage/r2";

/** Avatars are served from `/api/avatars/<userId>/<file>`. */
const AVATAR_PATH = "/api/avatars/";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const USER_ID = /^[A-Za-z0-9_-]{1,64}$/;
const AVATAR_FILE = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;

const CONTENT_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
} as const;

type AvatarExtension = keyof typeof CONTENT_TYPES;

/** The image type from its first bytes, rather than trusting the upload's label. */
function avatarExtension(bytes: Uint8Array): AvatarExtension | null {
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 0x89 && text(1, 4) === "PNG") return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") return "webp";
  return null;
}

function objectKey(userId: string, file: string): string {
  return `avatars/${userId}/${file}`;
}

/** Stores an avatar image and returns the URL to save on the account. */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new ValidationError("Images can be up to 2 MB");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = avatarExtension(bytes);
  if (!extension) throw new ValidationError("Use a PNG, JPEG, or WebP image");
  const name = `${randomUUID()}.${extension}`;
  const { bucket, client } = r2Storage();
  await client.send(
    new PutObjectCommand({
      Body: bytes,
      Bucket: bucket,
      CacheControl: "public, max-age=31536000, immutable",
      ContentType: CONTENT_TYPES[extension],
      Key: objectKey(userId, name),
    }),
  );
  return `${SITE_URL}${AVATAR_PATH}${userId}/${name}`;
}

/** Deletes an avatar this service stored; any other image URL is left alone. */
export async function deleteAvatar(
  userId: string,
  image: string | null | undefined,
): Promise<void> {
  if (!image) return;
  let pathname: string;
  try {
    pathname = new URL(image).pathname;
  } catch {
    return;
  }
  const prefix = `${AVATAR_PATH}${userId}/`;
  const file = pathname.slice(prefix.length);
  if (!pathname.startsWith(prefix) || !AVATAR_FILE.test(file)) return;
  const { bucket, client } = r2Storage();
  await client
    .send(
      new DeleteObjectCommand({ Bucket: bucket, Key: objectKey(userId, file) }),
    )
    .catch(() => {
      // An orphaned image is harmless: the account no longer points at it.
    });
}

/** A stored avatar for the public image route, or null when there isn't one. */
export async function readAvatar(userId: string, file: string) {
  if (!USER_ID.test(userId) || !AVATAR_FILE.test(file)) return null;
  const extension = file.split(".").pop() as AvatarExtension;
  const { bucket, client } = r2Storage();
  try {
    const object = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: objectKey(userId, file) }),
    );
    if (!object.Body) return null;
    return {
      body: object.Body.transformToWebStream(),
      contentType: CONTENT_TYPES[extension],
    };
  } catch (error) {
    if (error instanceof NoSuchKey) return null;
    throw error;
  }
}
