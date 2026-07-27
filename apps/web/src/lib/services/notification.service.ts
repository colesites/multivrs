import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import type {
  DashboardNotification,
  NotificationType,
} from "@/features/dashboard/types/notification.types";
import { prisma } from "@/lib/prisma";
import { notificationTypeSchema } from "@/lib/schemas/notification.schemas";

function mapNotification(row: {
  archivedAt: Date | null;
  createdAt: Date;
  href: string | null;
  id: string;
  message: string;
  readAt: Date | null;
  title: string;
  type: string;
}): DashboardNotification {
  return {
    archived: Boolean(row.archivedAt),
    createdAt: row.createdAt.toISOString(),
    href: row.href,
    id: row.id,
    message: row.message,
    read: Boolean(row.readAt),
    title: row.title,
    type: notificationTypeSchema.catch("info").parse(row.type),
  };
}

export async function createNotification(input: {
  href?: string;
  message: string;
  title: string;
  type: NotificationType;
  userId: string;
}): Promise<void> {
  await prisma.notification.create({ data: input });
}

export async function listNotifications(
  userId: string,
): Promise<DashboardNotification[]> {
  const rows = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    where: { archivedAt: null, userId },
  });
  return rows.map(mapNotification);
}

export async function mutateNotification(
  userId: string,
  input: { action: "archive" | "read" | "read_all"; id?: string },
): Promise<void> {
  if (input.action === "read_all") {
    await prisma.notification.updateMany({
      data: { readAt: new Date() },
      where: { archivedAt: null, readAt: null, userId },
    });
    return;
  }
  const result = await prisma.notification.updateMany({
    data:
      input.action === "archive"
        ? { archivedAt: new Date() }
        : { readAt: new Date() },
    where: { id: input.id, userId },
  });
  if (!result.count) throw new NotFoundError("Notification not found");
}
