"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MailCreateFields } from "@/features/mail/MailCreateFields";
import type { MailDashboardData } from "@/features/mail/mail.types";
import { submitMailResource } from "@/features/mail/mail-resource.client";
import {
  type CreateMailView,
  createMailLabel,
} from "@/features/mail/mail-resource-form";

interface SmtpConnection {
  host: string;
  port: number;
  tls: boolean;
  username: string;
}

export function MailCreateDialog({
  data,
  onOpenChange,
  open,
  projectId,
  view,
}: {
  data: MailDashboardData;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projectId?: string;
  view: CreateMailView;
}) {
  const router = useRouter();
  const params = useParams<{ username?: string; scope?: string }>();
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState<string>();
  const [connection, setConnection] = useState<SmtpConnection>();
  function submit(formData: FormData) {
    setSaving(true);
    void submitMailResource(view, formData, projectId).then((result) => {
      setSaving(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`${createMailLabel(view)} created`);
      if (result.secret) {
        setSecret(result.secret);
        setConnection(result.connection);
        toast.info("Copy this secret now. It will not be shown again.");
      } else {
        onOpenChange(false);
        if (
          view === "domains" &&
          result.id &&
          params.username &&
          params.scope
        ) {
          if (result.setupError) {
            toast.warning("Domain added, but automatic DNS needs attention");
          } else if (result.dnsMode === "automatic") {
            toast.info("Multivrs added the required DNS records automatically");
          }
          router.push(
            `/${params.username}/${params.scope}/email/domains/${result.id}`,
          );
        }
      }
      router.refresh();
    });
  }
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          setSecret(undefined);
          setConnection(undefined);
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="border border-white/10 bg-[#090a0d]">
        <DialogHeader>
          <DialogTitle>
            {secret
              ? "Copy your secret"
              : `Create ${createMailLabel(view).toLowerCase()}`}
          </DialogTitle>
          <DialogDescription>
            {secret
              ? "This value is only displayed once. Store it in a secret manager."
              : "This is stored in Multivrs and scoped to the current workspace."}
          </DialogDescription>
        </DialogHeader>
        {secret ? (
          <div className="space-y-3">
            {connection ? (
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-xs">
                <span className="text-white/40">Host</span>
                <code>{connection.host}</code>
                <span className="text-white/40">Port / security</span>
                <code>{connection.port} / TLS</code>
                <span className="text-white/40">Username</span>
                <code className="break-all">{connection.username}</code>
              </div>
            ) : null}
            <code className="block break-all rounded-lg border border-accent/20 bg-accent/[0.05] p-4 text-xs text-accent">
              {secret}
            </code>
            <Button
              className="w-full"
              onClick={async () => {
                const value = connection
                  ? `SMTP_HOST=${connection.host}\nSMTP_PORT=${connection.port}\nSMTP_USERNAME=${connection.username}\nSMTP_PASSWORD=${secret}\nSMTP_TLS=true`
                  : secret;
                await navigator.clipboard.writeText(value);
                toast.success(
                  connection ? "SMTP configuration copied" : "Secret copied",
                );
              }}
            >
              {connection ? "Copy SMTP configuration" : "Copy secret"}
            </Button>
          </div>
        ) : (
          <form action={submit} className="space-y-4">
            <MailCreateFields data={data} view={view} />
            <DialogFooter>
              <Button disabled={saving} type="submit">
                {saving
                  ? "Creating…"
                  : `Create ${createMailLabel(view).toLowerCase()}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
