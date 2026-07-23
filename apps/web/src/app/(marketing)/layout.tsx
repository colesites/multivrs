import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import Footer from "@/components/nav/Footer";
import { Navbar } from "@/components/nav/Navbar";
import { DomainCommerceProvider } from "@/features/domains/DomainCommerceProvider";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DomainCommerceProvider>
      <SmoothScroll />
      <Navbar />
      {children}
      <Footer />
    </DomainCommerceProvider>
  );
}
