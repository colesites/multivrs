import { NotificationsPanel } from "@/features/dashboard/components/NotificationsPanel";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";

export function NotificationsPage({
  notifications,
}: {
  notifications: DashboardNotification[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Deployment, domain, and platform activity.
      </p>
      <div className="mt-8 overflow-hidden border border-[var(--hairline)]">
        <NotificationsPanel initialNotifications={notifications} />
      </div>
    </div>
  );
}
