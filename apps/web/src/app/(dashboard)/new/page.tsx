import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewProjectFlow } from "@/features/dashboard/components/NewProjectFlow";
import { NewProjectHeader } from "@/features/dashboard/components/NewProjectHeader";
import { getServerSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New Project — Multivrs",
  description: "Deploy a new project or import a Git repository on Multivrs",
};

export default async function NewProjectPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/new");
  const username = session.user.username ?? session.user.id;
  return (
    <div className="min-h-screen w-full bg-[#030303] text-white">
      <NewProjectHeader />
      <main className="w-full">
        <NewProjectFlow username={username} />
      </main>
    </div>
  );
}
