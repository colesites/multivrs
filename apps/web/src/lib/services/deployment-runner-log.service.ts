import { prisma } from "@/lib/prisma";

export async function appendRunnerLog(
  deploymentId: string,
  message: string,
): Promise<void> {
  await prisma.deploymentLog.create({
    data: { deploymentId, level: "info", message },
  });
}
