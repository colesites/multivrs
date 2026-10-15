"use client";

import { Check, Copy } from "lucide-react";
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
import type { MailResources } from "@/features/mail/mail.types";
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
  resources,
  onOpenChange,
  open,
  projectId,
  view,
}: {
  resources: MailResources;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projectId?: string;
  view: CreateMailView;
}) {
  const router = useRouter();
  const params = useParams<{ username?: string; scope?: string }>();
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [connection, setConnection] = useState<SmtpConnection>();

  const resetSecret = () => {
    setSecret(undefined);
    setCopied(false);
    setConnection(undefined);
  };
  function submit(formData: FormData) {
    setSaving(true);
    void submitMailResource(view, formData, projectId, params.username).then(
      (result) => {
        setSaving(false);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        toast.success(`${createMailLabel(view)} created`);
        if (result.secret) {
          setSecret(result.secret);
          setCopied(false);
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
              toast.info(
                "Multivrs added the required DNS records automatically",
              );
            }
            router.push(
              `/${params.username}/${params.scope}/email/domains/${result.id}`,
            );
          }
        }
        router.refresh();
      },
    );
  }
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          resetSecret();
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
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
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-black/10 dark:border-white/10 bg-black/2.5 dark:bg-white/2.5 p-3 text-xs">
                <span className="text-black/40 dark:text-white/40">Host</span>
                <code>{connection.host}</code>
                <span className="text-black/40 dark:text-white/40">
                  Port / security
                </span>
                <code>{connection.port} / TLS</code>
                <span className="text-black/40 dark:text-white/40">
                  Username
                </span>
                <code className="break-all">{connection.username}</code>
              </div>
            ) : null}
            <div className="rounded-lg border border-black/15 dark:border-white/20 bg-neutral-100 dark:bg-neutral-900 p-4">
              <code className="block break-all font-mono text-xs font-semibold text-black dark:text-white select-all">
                {secret}
              </code>
            </div>
            <Button
              className="w-full gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium"
              onClick={async () => {
                const value = connection
                  ? `SMTP_HOST=${connection.host}\nSMTP_PORT=${connection.port}\nSMTP_USERNAME=${connection.username}\nSMTP_PASSWORD=${secret}\nSMTP_TLS=true`
                  : secret;
                await navigator.clipboard.writeText(value);
                setCopied(true);
                toast.success(
                  connection ? "SMTP configuration copied" : "Secret copied to clipboard",
                );
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied
                ? "Copied to clipboard!"
                : connection
                  ? "Copy SMTP configuration"
                  : "Copy secret"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                resetSecret();
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form action={submit} className="space-y-4">
            <MailCreateFields resources={resources} view={view} />
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
