import type { Metadata } from "next";
import { Sidebar } from "@/features/dashboard";
import { Header } from "@/features/dashboard";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex h-screen w-full bg-background text-foreground font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Dynamic Stakent/Space Overlays */}
      <div className="absolute inset-0 z-0 noise-overlay opacity-20 pointer-events-none" />
      <div className="absolute inset-0 z-0 grid-overlay opacity-50 pointer-events-none" />
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col pl-[310px] w-full h-full">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto dashboard-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
