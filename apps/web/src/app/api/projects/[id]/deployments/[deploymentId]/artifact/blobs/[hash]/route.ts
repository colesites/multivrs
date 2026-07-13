import { createHash } from "node:crypto";
import { ValidationError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createArtifactStore } from "@/lib/artifacts/store";
import { getDeployment } from "@/lib/services/deployment.service";

const MAX_BLOB_SIZE = 100 * 1024 * 1024;

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string; hash: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId, hash } = await params;
    await getDeployment(userId, id, deploymentId);
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      throw new ValidationError("Invalid artifact blob hash");
    }
    const declaredSize = Number(request.headers.get("content-length") ?? 0);
    if (declaredSize > MAX_BLOB_SIZE) {
      throw new ValidationError("Artifact blob exceeds 100 MiB");
    }
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.byteLength > MAX_BLOB_SIZE) {
      throw new ValidationError("Artifact blob exceeds 100 MiB");
    }
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== hash) {
      throw new ValidationError("Artifact blob hash mismatch");
    }
    await createArtifactStore().put(hash, bytes);
    return ok({ hash, size: bytes.byteLength });
  } catch (error) {
    return fail(error);
  }
}
