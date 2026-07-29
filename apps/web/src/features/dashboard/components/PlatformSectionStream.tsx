import { Suspense } from "react";
import { DashboardSectionSkeleton } from "@/features/dashboard/components/DashboardSectionSkeleton";
import { ProjectPlatformSection } from "@/features/dashboard/components/ProjectPlatformSection";
import type { SectionMeta } from "@/features/dashboard/constants/sections";
import type { PlatformSection } from "@/features/dashboard/lib/project-platform-sections";
import { MailPageSkeleton } from "@/features/mail/MailPageSkeleton";
import { parseMailView } from "@/features/mail/mail-view";

export function PlatformSectionStream({
  compose,
  meta,
  requestedView,
  scope,
  section,
  username,
}: {
  compose?: string;
  meta: SectionMeta;
  requestedView?: string;
  scope: string;
  section: PlatformSection;
  username: string;
}) {
  return (
    <Suspense
      fallback={
        section === "emails" ? (
          <MailPageSkeleton />
        ) : (
          <DashboardSectionSkeleton
            requestedScope={scope}
            requestedSection={section}
          />
        )
      }
    >
      <ProjectPlatformSection
        initialMailCompose={compose === "1"}
        initialMailView={parseMailView(requestedView)}
        meta={meta}
        scope={scope}
        section={section}
        username={username}
      />
    </Suspense>
  );
}
