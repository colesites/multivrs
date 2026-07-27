import type { Metadata } from "next";
import { Suspense } from "react";
import { NewProjectHeader } from "@/features/dashboard/components/NewProjectHeader";
import { NewProjectImportFlow } from "@/features/dashboard/components/NewProjectImportFlow";

export const metadata: Metadata = {
  title: "Import Project — Multivrs",
  description: "Configure framework preset and deploy repository on Multivrs",
};

export default function NewProjectImportPage() {
  return (
    <div className="min-h-screen w-full bg-[#030303] text-white">
      <NewProjectHeader />
      <main className="w-full">
        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl p-8 text-sm text-muted-foreground">
              Loading repository…
            </div>
          }
        >
          <NewProjectImportFlow />
        </Suspense>
      </main>
    </div>
  );
}
