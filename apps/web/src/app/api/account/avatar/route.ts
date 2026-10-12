/**
 * /api/account/avatar — your profile picture.
 *   POST   → upload an image (multipart `file`) and use it as your avatar
 *   DELETE → remove your avatar
 */
import { ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { requireSessionUserId } from "@/lib/api/session";
import {
  getAccountProfile,
  setAccountImage,
} from "@/lib/services/account.service";
import {
  deleteAvatar,
  uploadAvatar,
} from "@/lib/services/avatar-storage.service";

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) {
      throw new ValidationError("Choose an image to upload");
    }
    const [previous, image] = await Promise.all([
      getAccountProfile(userId),
      uploadAvatar(userId, file),
    ]);
    const profile = await setAccountImage(userId, image);
    await deleteAvatar(userId, previous.image);
    return ok(profile);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE() {
  try {
    const userId = await requireSessionUserId();
    const previous = await getAccountProfile(userId);
    const profile = await setAccountImage(userId, null);
    await deleteAvatar(userId, previous.image);
    return ok(profile);
  } catch (error) {
    return fail(error);
  }
}
