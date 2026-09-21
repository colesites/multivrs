import type { Metadata } from "next";
import { EmailsCta } from "@/components/marketing/emails/EmailsCta";
import { EmailsDeliverability } from "@/components/marketing/emails/EmailsDeliverability";
import { EmailsFeatures } from "@/components/marketing/emails/EmailsFeatures";
import { EmailsHero } from "@/components/marketing/emails/EmailsHero";
import { EmailsIntegrate } from "@/components/marketing/emails/EmailsIntegrate";
import { EmailsShowcase } from "@/components/marketing/emails/EmailsShowcase";

export const metadata: Metadata = {
  title: "Emails | Multivrs",
  description:
    "Send transactional and campaign email from your own domain, receive replies as real threads, and track every delivery event with signed webhooks.",
  alternates: { canonical: "/emails" },
};

export default function EmailsPage() {
  return (
    <>
      {/* Hero, mailbox showcase and integrate stay dark, like the rest of the
          page's opening act; the navbar switches to light-on-dark over them. */}
      <div
        id="dark-marketing-header"
        className="dark relative z-10 bg-black text-foreground"
      >
        <div className="absolute inset-x-0 bottom-full h-[50vh] bg-black" />
        <EmailsHero />
        <EmailsShowcase />
        <EmailsIntegrate />
      </div>
      <div className="relative z-10 bg-background text-foreground">
        <EmailsFeatures />
        <EmailsDeliverability />
        <EmailsCta />
      </div>
    </>
  );
}
