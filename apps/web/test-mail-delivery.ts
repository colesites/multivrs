import { PrismaClient } from "@prisma/client";
import { deliverMailMessage } from "./src/lib/services/mail-delivery.service";

const prisma = new PrismaClient();

async function main() {
  const msg = await prisma.mailMessage.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "desc" },
  });
  if (!msg) {
    return;
  }
  try {
    await deliverMailMessage(msg.userId, msg.id);
  } catch (error) {
    console.error("deliverMailMessage threw an error:", error);
  }
}

main().finally(() => prisma.$disconnect());
