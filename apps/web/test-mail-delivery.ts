import { PrismaClient } from "@prisma/client";
import { deliverMailMessage } from "./src/lib/services/mail-delivery.service";

const prisma = new PrismaClient();

async function main() {
  const msg = await prisma.mailMessage.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "desc" },
  });
  if (!msg) {
    console.log("No queued messages found.");
    return;
  }
  console.log("Found queued message:", msg.id);
  console.log("Delivering...");
  try {
    await deliverMailMessage(msg.userId, msg.id);
    console.log("deliverMailMessage completed");
  } catch (error) {
    console.error("deliverMailMessage threw an error:", error);
  }
  const updated = await prisma.mailMessage.findUnique({
    where: { id: msg.id },
  });
  console.log("New status:", updated?.status);
}

main().finally(() => prisma.$disconnect());
