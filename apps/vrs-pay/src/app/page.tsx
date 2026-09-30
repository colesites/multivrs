import { Developers } from "@/components/site/developers";
import { Features } from "@/components/site/features";
import { Hero } from "@/components/site/hero";
import { LogoCloud } from "@/components/site/logo-cloud";
import { Platform } from "@/components/site/platform";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Testimonial } from "@/components/site/testimonial";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <Developers />
        <Platform />
        <Testimonial />
      </main>
      <SiteFooter />
    </>
  );
}
