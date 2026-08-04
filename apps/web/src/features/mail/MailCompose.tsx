"use client";

import { Clock3, Maximize2, Minimize2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useResponsiveSheetSide } from "@/features/domains/use-responsive-sheet-side";
import { MailComposeFields } from "@/features/mail/MailComposeFields";
import type {
  MailboxSummary,
  MailMessageDetail,
} from "@/features/mail/mail.types";
import { submitMailCompose } from "@/features/mail/mail-compose.client";
import { cn } from "@/lib/utils";

export function MailCompose({
  mailboxes,
  forward,
  onOpenChange,
  open,
  reply,
}: {
  mailboxes: MailboxSummary[];
  forward?: MailMessageDetail;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reply?: MailMessageDetail;
}) {
  const router = useRouter();
  const side = useResponsiveSheetSide();
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  function submit(formData: FormData) {
    setSending(true);
    void submitMailCompose(formData, reply).then((result) => {
      setSending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        formData.get("scheduledAt") ? "Email scheduled" : "Email queued",
      );
      onOpenChange(false);
      router.refresh();
    });
  }
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn(
          "w-full border-black/10 dark:border-white/10 bg-white dark:bg-[#07080a] transition-[max-width] duration-200 sm:max-w-xl",
          expanded && "sm:max-w-[min(92vw,1100px)]",
        )}
        side={side}
        style={
          expanded
            ? side === "bottom"
              ? {
                  bottom: "1rem",
                  height: "calc(100dvh - 2rem)",
                  left: "1rem",
                  maxHeight: "none",
                  maxWidth: "none",
                  right: "1rem",
                  width: "auto",
                }
              : {
                  bottom: "1rem",
                  height: "auto",
                  left: "1rem",
                  maxWidth: "none",
                  right: "1rem",
                  top: "1rem",
                  width: "auto",
                }
            : undefined
        }
      >
        <SheetHeader className="relative border-b border-black/10 dark:border-white/10 pr-14">
          <SheetTitle>
            {reply ? "Reply" : forward ? "Forward message" : "New message"}
          </SheetTitle>
          <SheetDescription>
            Rich text, inline images, links, and attachments are supported.
          </SheetDescription>
          <Button
            aria-label={expanded ? "Restore compose size" : "Expand compose"}
            className="absolute right-12 top-4"
            onClick={() => setExpanded((value) => !value)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </SheetHeader>
        <form action={submit} className="flex min-h-0 flex-1 flex-col">
          <MailComposeFields
            forward={forward}
            mailboxes={mailboxes}
            reply={reply}
          />
          <SheetFooter className="border-t border-black/10 dark:border-white/10">
            <Button disabled={sending || !mailboxes.length} type="submit">
              <Send />
              {sending ? "Queuing…" : "Send message"}
            </Button>
            <p className="flex items-center gap-1 text-[10px] text-black/30 dark:text-white/30">
              <Clock3 className="size-3" />
              Scheduled mail is held until its send time.
            </p>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
