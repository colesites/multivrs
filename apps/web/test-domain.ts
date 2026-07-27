import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found");
      return;
    }
    console.log("User:", user.id);
    
    const domain = "testdomain.com";
    const token = createHash("sha256").update(`${domain}:multivrs-mail`).digest("hex").slice(0, 32);
    const records = [
      { purpose: "ownership", type: "TXT", name: `_multivrs.${domain}`, value: `multivrs-verification=${token}` },
    ];
    
    const mailDomain = await prisma.mailDomain.create({
      data: {
        domain: "testdomain.com",
        kind: "sending",
        userId: user.id,
        dnsRecords: { create: records },
      },
      include: { dnsRecords: true },
    });
    console.log("Success:", mailDomain);
    
    // Cleanup
    await prisma.mailDomain.delete({ where: { id: mailDomain.id } });
  } catch (error) {
    console.error("Error creating domain:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
