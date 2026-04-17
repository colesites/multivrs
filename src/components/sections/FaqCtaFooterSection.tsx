import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FAQ_ITEMS } from "@/components/sections/home.data";

export function FaqCtaFooterSection() {
  return (
    <section id="company" className="border-t border-white/10 bg-[#030507] px-6 pb-12 pt-18 sm:pt-22 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div>
          <h2 className="font-clash text-4xl text-white sm:text-5xl">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {FAQ_ITEMS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <h3 className="font-clash text-xl text-white">{item.title}</h3>
                <p className="mt-2 font-acari text-sm text-white/65">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(56,189,248,0.2),transparent_70%)] p-8">
          <p className="font-acari text-xs uppercase tracking-[0.2em] text-white/50">Final CTA</p>
          <h3 className="mt-3 max-w-3xl font-clash text-3xl text-white sm:text-4xl">
            Launch your next software universe on Multivrs Space.
          </h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-full bg-white px-6 text-black hover:bg-white/90">Start free</Button>
            <Button variant="outline" className="rounded-full border-white/20 bg-white/5 px-6 text-white">
              Book a demo
            </Button>
          </div>
        </div>

        <footer className="border-t border-white/10 pt-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="font-clash text-lg tracking-wide text-white">MULTIVRS</p>
            <nav className="flex flex-wrap gap-4 text-sm text-white/60">
              <Link href="/products" className="hover:text-white">Products</Link>
              <Link href="/docs" className="hover:text-white">Developer Tools</Link>
              <Link href="/resources" className="hover:text-white">Resources</Link>
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/about" className="hover:text-white">Company</Link>
            </nav>
          </div>
        </footer>
      </div>
    </section>
  );
}
