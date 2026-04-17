import Link from "next/link";
import { DEV_EXPERIENCE } from "@/components/sections/home.data";

const RESOURCE_LINKS = [
  { label: "Documentation", href: "/docs" },
  { label: "Engineering Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Guides", href: "/resources" },
] as const;

export function DeveloperResourcesSection() {
  return (
    <section className="border-t border-white/10 bg-[#03060d] px-6 py-18 sm:py-22 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-2">
        <div id="developer-tools" className="rounded-3xl border border-white/10 bg-white/3 p-7">
          <p className="font-acari text-xs uppercase tracking-[0.2em] text-white/45">
            Developer tools
          </p>
          <h2 className="mt-3 font-clash text-4xl text-white">Built for developer velocity</h2>
          <div className="mt-6 space-y-4">
            {DEV_EXPERIENCE.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-clash text-xl text-white">{item.title}</h3>
                <p className="mt-2 font-acari text-sm text-white/65">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div id="resources" className="rounded-3xl border border-white/10 bg-white/4 p-7">
          <p className="font-acari text-xs uppercase tracking-[0.2em] text-white/45">
            Resources
          </p>
          <h2 className="mt-3 font-clash text-4xl text-white">Learn, ship, and scale faster</h2>
          <p className="mt-3 font-acari text-sm leading-relaxed text-white/65">
            Tutorials, docs, and changelogs designed for shipping teams.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-acari text-sm text-white/80 transition-colors hover:border-white/20 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
