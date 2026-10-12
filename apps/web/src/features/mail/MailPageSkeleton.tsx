"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MailOverviewHero } from "@/features/mail/MailOverviewHero";
import {
  MailOverviewDataSkeleton,
  MailResourceSkeleton,
  MailThreadListSkeleton,
} from "@/features/mail/MailSkeletons";
import { type MailView, parseMailView } from "@/features/mail/mail-view";

const FOLDER_VIEWS = new Set<MailView>([
  "inbox",
  "starred",
  "sent",
  "drafts",
  "archive",
  "spam",
  "trash",
]);

/** The loading state for one mail view, shaped like that view. */
export function MailViewSkeleton({ view }: { view: MailView }) {
  if (FOLDER_VIEWS.has(view)) return <MailThreadListSkeleton view={view} />;
  if (view === "overview") {
    return (
      <div className="w-full min-w-0 max-w-full space-y-6 px-4 py-6 sm:space-y-8 sm:px-5 sm:py-8 lg:px-8">
        <MailOverviewHero />
        <MailOverviewDataSkeleton />
      </div>
    );
  }
  return <MailResourceSkeleton />;
}

/**
 * The mail page's loading state. Pass the view when it's known; otherwise it
 * is read from `?view=` in the URL.
 */
export function MailPageSkeleton({ view }: { view?: MailView }) {
  if (view) return <MailViewSkeleton view={view} />;
  return (
    <Suspense fallback={<MailViewSkeleton view="overview" />}>
      <ViewFromUrl />
    </Suspense>
  );
}

function ViewFromUrl() {
  const view = parseMailView(useSearchParams().get("view") ?? undefined);
  return <MailViewSkeleton view={view} />;
}
