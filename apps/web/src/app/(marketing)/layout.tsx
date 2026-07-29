import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import Footer from "@/components/nav/Footer";
import { Navbar } from "@/components/nav/Navbar";
import { DomainCommerceProvider } from "@/features/domains/DomainCommerceProvider";
import { acari, clashDisplay } from "@/lib/marketing-fonts";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${acari.variable} ${clashDisplay.variable}`}>
      <DomainCommerceProvider>
        <SmoothScroll />
        <Navbar />
        {children}
        <Footer />
      </DomainCommerceProvider>
    </div>
  );
}
