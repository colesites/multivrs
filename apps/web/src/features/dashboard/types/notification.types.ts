export type NotificationType = "error" | "info" | "success" | "warning";

export interface DashboardNotification {
  archived: boolean;
  createdAt: string;
  href: string | null;
  id: string;
  message: string;
  read: boolean;
  title: string;
  type: NotificationType;
}
