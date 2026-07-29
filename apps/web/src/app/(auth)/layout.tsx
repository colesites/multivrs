import { Suspense } from "react";
import { acari, clashDisplay } from "@/lib/marketing-fonts";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${acari.variable} ${clashDisplay.variable}`}>
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}
