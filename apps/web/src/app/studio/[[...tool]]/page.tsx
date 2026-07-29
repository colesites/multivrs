/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { NextStudio } from "next-sanity/studio";
import { Suspense } from "react";
import config from "../../../../sanity.config";

export const metadata: Metadata = {
  referrer: "same-origin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <RequestTimeStudio />
    </Suspense>
  );
}

async function RequestTimeStudio() {
  await connection();
  return <NextStudio config={config} />;
}
