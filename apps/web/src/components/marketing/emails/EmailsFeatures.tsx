import { AudiencesCard } from "./EmailsAudiences";
import { CampaignComposer } from "./EmailsBroadcasts";
import { InboxShowcase } from "./EmailsInbox";
import { SectionHeading } from "./EmailsSectionHeading";
import { TestModeCard } from "./EmailsTestMode";
import { WebhooksCard } from "./EmailsWebhooks";

/** The middle of the /emails page: developer experience, inbox, campaigns. */
export function EmailsFeatures() {
  return (
    <>
      <section className="w-full border-t border-border bg-background py-24 text-foreground lg:py-32">
        <div className="marketing-container">
          <SectionHeading
            eyebrow="Developer experience"
            title="Built for the way you ship."
            body="Experiment safely, then watch every message move through its lifecycle in real time."
          />
          <div className="grid gap-4 lg:grid-cols-6">
            <TestModeCard />
            <WebhooksCard />
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border bg-background py-24 text-foreground lg:py-32">
        <div className="marketing-container">
          <InboxShowcase />
        </div>
      </section>

      <section className="w-full border-t border-border bg-background py-24 text-foreground lg:py-32">
        <div className="marketing-container">
          <SectionHeading
            eyebrow="Campaigns"
            title="Go beyond transactional."
            body="Reach your whole audience from the same domain, with the same deliverability and the same logs."
          />
          <div className="grid gap-4 lg:grid-cols-6">
            <CampaignComposer />
            <AudiencesCard />
          </div>
        </div>
      </section>
    </>
  );
}
