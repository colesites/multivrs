"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog, responseError } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

/**
 * Removes the sending domain from Multivrs and AWS. Adding it again starts
 * a fresh AWS check with new DKIM records.
 */
export function MailDomainDeleteButton({
  domainId,
  domain,
  backHref,
}: {
  domainId: string;
  domain: string;
  backHref: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    const response = await fetch(`/api/mail/domains/${domainId}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!response?.ok) {
      toast.error(
        await responseError(response, "Couldn't remove the domain. Try again."),
      );
      setDeleting(false);
      return;
    }
    toast.success(`${domain} removed`);
    router.push(backHref);
    router.refresh();
  }

  return (
    <>
      <Button
        disabled={deleting}
        onClick={() => setConfirming(true)}
        variant="outline"
        className="text-red-400 hover:text-red-400"
      >
        <Trash2 className="size-4" />
        Remove
      </Button>
      <ConfirmDialog
        busy={deleting}
        confirmLabel="Remove"
        description="This removes it from Multivrs and AWS. You can add it again to get new DKIM records, then replace the old ones at your DNS provider."
        onConfirm={() => void remove()}
        onOpenChange={setConfirming}
        open={confirming}
        title={`Remove ${domain}?`}
      />
    </>
  );
}
