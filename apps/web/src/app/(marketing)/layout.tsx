import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import Footer from "@/components/nav/Footer";
import { Navbar } from "@/components/nav/Navbar";
import { DomainCommerceProvider } from "@/features/domains/DomainCommerceProvider";
import { acari, clashDisplay } from "@/lib/marketing-fonts";
import { SanityLive } from "@/sanity/lib/live";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <div className={`${acari.variable} ${clashDisplay.variable}`}>
      <DomainCommerceProvider>
        <SmoothScroll />
        <Navbar />
        {children}
        <Footer />
        <SanityLive includeDrafts={isDraftMode} />
        {isDraftMode && <VisualEditing />}
      </DomainCommerceProvider>
    </div>
  );
}
