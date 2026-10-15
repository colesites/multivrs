"use client";

import { Clock3, Maximize2, Minimize2, Send, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { useResponsiveSheetSide } from "@/features/domains/use-responsive-sheet-side";
import { ComposeField } from "@/features/mail/MailFormControls";
import { MailRichEditor } from "@/features/mail/MailRichEditor";
import type { MailResources } from "@/features/mail/mail.types";
import { useMailData } from "@/features/mail/mail-context";
import { submitMailResource } from "@/features/mail/mail-resource.client";
import { cn } from "@/lib/utils";

export function MailBroadcastCompose({
  open,
  onOpenChange,
  projectId,
  resources,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  resources: MailResources;
}) {
  const router = useRouter();
  const params = useParams<{ username?: string; scope?: string }>();
  const mailData = useMailData();
  const side = useResponsiveSheetSide();
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const mailboxes = mailData.mailboxes || [];
  const audiences = resources.audiences || [];

  function submit(formData: FormData) {
    setSending(true);
    void submitMailResource("broadcasts", formData, projectId, params.username).then(
      (result) => {
        setSending(false);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        const isScheduled = !!formData.get("scheduledAt");
        toast.success(isScheduled ? "Broadcast scheduled" : "Broadcast created and queued");
        onOpenChange(false);
        router.refresh();
      },
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn(
          "w-full flex flex-col border-black/10 dark:border-white/10 bg-white dark:bg-[#07080a] transition-[max-width] duration-200 sm:max-w-xl",
          expanded && "sm:max-w-[min(92vw,1100px)]",
          side === "bottom" && "max-h-[calc(100dvh-2rem)] rounded-t-xl",
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
        <SheetHeader className="relative border-b border-black/10 dark:border-white/10 pr-14 pb-4">
          <SheetTitle className="text-base font-semibold">
            New broadcast campaign
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Draft, schedule, and send campaigns to your consent-aware audience.
          </SheetDescription>
          <Button
            aria-label={expanded ? "Restore compose size" : "Expand compose"}
            className="absolute right-4 top-4 size-8 p-0"
            onClick={() => setExpanded((prev) => !prev)}
            type="button"
            variant="ghost"
          >
            {expanded ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </SheetHeader>

        <form action={submit} className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
            {/* Campaign Name */}
            <ComposeField label="Campaign">
              <Input
                name="name"
                placeholder="e.g. October Product Launch"
                required
                className="font-sans text-sm"
              />
            </ComposeField>

            {/* From Mailbox */}
            <ComposeField label="From">
              {mailboxes.length > 0 ? (
                <select
                  name="fromAddress"
                  className="h-10 w-full rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 text-sm outline-hidden font-sans"
                  required
                >
                  {mailboxes.map((mb) => (
                    <option key={mb.id} value={mb.address}>
                      {mb.name} &lt;{mb.address}&gt;
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  name="fromAddress"
                  type="email"
                  placeholder="marketing@yourdomain.com"
                  required
                  className="font-sans text-sm"
                />
              )}
            </ComposeField>

            {/* Audience Picker */}
            <ComposeField label="Audience">
              {audiences.length > 0 ? (
                <select
                  name="audienceId"
                  className="h-10 w-full rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 text-sm outline-hidden font-sans"
                  required
                >
                  {audiences.map((aud) => (
                    <option key={aud.id} value={aud.id}>
                      {aud.name} {aud.hint ? `(${aud.hint})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
                  <Users className="size-4 shrink-0" />
                  <span>
                    No audiences found. Create an audience in Emails &gt; Audiences before launching.
                  </span>
                </div>
              )}
            </ComposeField>

            {/* Subject */}
            <ComposeField label="Subject">
              <Input
                name="subject"
                placeholder="What we shipped this week…"
                required
                className="font-sans text-sm font-medium"
              />
            </ComposeField>

            {/* Message Body */}
            <ComposeField label="Message">
              <textarea
                name="body"
                rows={10}
                required
                placeholder="Write your broadcast campaign content here…"
                className="w-full min-h-[220px] rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 text-sm font-sans leading-relaxed outline-hidden resize-y placeholder:text-muted-foreground focus:ring-1 focus:ring-purple-500"
              />
            </ComposeField>

            {/* Schedule */}
            <ComposeField label="Schedule">
              <Input
                name="scheduledAt"
                type="datetime-local"
                className="font-sans text-sm"
              />
            </ComposeField>
          </div>

          <SheetFooter className="border-t border-black/10 dark:border-white/10 p-4 flex flex-row items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending}
              className="gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium"
            >
              {sending ? (
                "Sending…"
              ) : (
                <>
                  <Send className="size-4" />
                  Send campaign
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
