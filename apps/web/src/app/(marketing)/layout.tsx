import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import Footer from "@/components/nav/Footer";
import { Navbar } from "@/components/nav/Navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
