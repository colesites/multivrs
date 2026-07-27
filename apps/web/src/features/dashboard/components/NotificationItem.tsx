import { Archive, CircleAlert, CircleCheck, Info } from "lucide-react";
import Link from "next/link";
import type {
  DashboardNotification,
  NotificationType,
} from "@/features/dashboard/types/notification.types";
import { cn } from "@/lib/utils";

const ICONS = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
} satisfies Record<NotificationType, typeof Info>;

function NotificationContent({ item }: { item: DashboardNotification }) {
  const Icon = ICONS[item.type];
  const tone =
    item.type === "error"
      ? "border-red-500/30 text-red-400"
      : item.type === "warning"
        ? "border-amber-500/30 text-amber-400"
        : "border-blue-500/30 text-blue-400";
  return (
    <>
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
          tone,
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{item.title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {item.message}
        </span>
        <span className="mt-1 block text-[10px] text-muted-foreground/60">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      </span>
    </>
  );
}

export function NotificationItem({
  busy,
  item,
  mutate,
}: {
  busy: boolean;
  item: DashboardNotification;
  mutate: (action: "archive" | "read", id: string) => Promise<void>;
}) {
  const content = <NotificationContent item={item} />;
  return (
    <div
      className={cn(
        "group flex gap-3 border-b border-[var(--hairline)] p-3",
        !item.read && "bg-blue-500/[0.035]",
      )}
    >
      {item.href ? (
        <Link
          href={item.href}
          onClick={() => mutate("read", item.id)}
          className="flex min-w-0 flex-1 gap-3"
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => mutate("read", item.id)}
          className="flex min-w-0 flex-1 gap-3 text-left"
        >
          {content}
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => mutate("archive", item.id)}
        className="self-start rounded-md p-1 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
        aria-label="Archive notification"
      >
        <Archive className="size-3.5" />
      </button>
    </div>
  );
}
