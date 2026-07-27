"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MAIL_NAVIGATION,
  type MailView,
} from "@/features/mail/mail-navigation";

export function MailMobileMenu({
  onOpenChange,
  onView,
  open,
  view,
}: {
  onOpenChange: (open: boolean) => void;
  onView: (view: MailView) => void;
  open: boolean;
  view: MailView;
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="w-[82vw] border-white/10 bg-[#090a0d]"
        side="left"
      >
        <SheetHeader className="border-b border-white/[0.07]">
          <SheetTitle>Multivrs Mail</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-3">
          {MAIL_NAVIGATION.map((item) =>
            "divider" in item ? (
              <p
                className="mb-1 mt-5 px-3 font-mono text-[9px] tracking-[0.17em] text-white/25"
                key={item.divider}
              >
                {item.divider}
              </p>
            ) : (
              <Button
                className="mb-1 w-full justify-start"
                key={item.view}
                onClick={() => {
                  onView(item.view);
                  onOpenChange(false);
                }}
                variant={view === item.view ? "secondary" : "ghost"}
              >
                <item.icon />
                {item.label}
              </Button>
            ),
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
