"use client";

import { Clock3, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useResponsiveSheetSide } from "@/features/domains/use-responsive-sheet-side";
import { ComposeField } from "@/features/mail/MailFormControls";
import type {
  MailboxSummary,
  MailMessageDetail,
} from "@/features/mail/mail.types";
import { submitMailCompose } from "@/features/mail/mail-compose.client";

export function MailCompose({
  mailboxes,
  onOpenChange,
  open,
  reply,
}: {
  mailboxes: MailboxSummary[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reply?: MailMessageDetail;
}) {
  const router = useRouter();
  const side = useResponsiveSheetSide();
  const [sending, setSending] = useState(false);
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
        className="w-full border-white/10 bg-[#090a0d] sm:max-w-xl"
        side={side}
      >
        <SheetHeader className="border-b border-white/[0.07]">
          <SheetTitle>New message</SheetTitle>
          <SheetDescription>
            Send from a verified Multivrs mailbox.
          </SheetDescription>
        </SheetHeader>
        <form action={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {!mailboxes.length ? (
              <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs text-amber-100">
                Create a mailbox and verify its domain before sending.
              </p>
            ) : null}
            <ComposeField label="From">
              <select
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm outline-none"
                defaultValue={mailboxes[0]?.id}
                name="mailboxId"
                required
              >
                {mailboxes.map((mailbox) => (
                  <option key={mailbox.id} value={mailbox.id}>
                    {mailbox.name} &lt;{mailbox.address}&gt;
                  </option>
                ))}
              </select>
            </ComposeField>
            <ComposeField label="To">
              <Input
                defaultValue={reply?.fromAddress}
                name="to"
                placeholder="person@example.com, teammate@example.com"
                required
              />
            </ComposeField>
            <ComposeField label="Cc">
              <Input name="cc" placeholder="Optional" />
            </ComposeField>
            <ComposeField label="Subject">
              <Input
                defaultValue={reply ? `Re: ${reply.subject}` : ""}
                name="subject"
                required
              />
            </ComposeField>
            <ComposeField label="Message">
              <Textarea
                className="min-h-56 resize-none"
                name="text"
                placeholder="Write your message…"
                required
              />
            </ComposeField>
            <ComposeField label="Schedule">
              <Input name="scheduledAt" type="datetime-local" />
            </ComposeField>
          </div>
          <SheetFooter className="border-t border-white/[0.07]">
            <Button disabled={sending || !mailboxes.length} type="submit">
              <Send />
              {sending ? "Queuing…" : "Send message"}
            </Button>
            <p className="flex items-center gap-1 text-[10px] text-white/30">
              <Clock3 className="size-3" />
              Scheduled mail is held until its send time.
            </p>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
