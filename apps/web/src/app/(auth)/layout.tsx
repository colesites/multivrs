import { acari, clashDisplay } from "@/lib/marketing-fonts";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${acari.variable} ${clashDisplay.variable}`}>
      {children}
    </div>
  );
}
