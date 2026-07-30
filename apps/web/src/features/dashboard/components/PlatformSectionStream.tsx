import { Suspense } from "react";
import { DashboardSectionSkeleton } from "@/features/dashboard/components/DashboardSectionSkeleton";
import { ProjectPlatformSection } from "@/features/dashboard/components/ProjectPlatformSection";
import type { SectionMeta } from "@/features/dashboard/constants/sections";
import type { PlatformSection } from "@/features/dashboard/lib/project-platform-sections";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import { MailPageSkeleton } from "@/features/mail/MailPageSkeleton";
import { parseMailView } from "@/features/mail/mail-view";

export function PlatformSectionStream({
  analyticsRange,
  compose,
  meta,
  requestedView,
  scope,
  section,
  username,
}: {
  analyticsRange: AnalyticsRange;
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
        analyticsRange={analyticsRange}
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
