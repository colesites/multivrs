import { TESTIMONIALS } from "@/components/sections/home.data";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-t border-white/10 bg-[#04070e] px-6 py-18 sm:py-22 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="font-clash text-4xl text-white sm:text-5xl">Teams shipping faster with Multivrs</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/4 p-7"
            >
              <p className="font-acari text-base leading-relaxed text-white/80">
                “{item.description}”
              </p>
              <footer className="mt-5 font-clash text-lg text-white">{item.title}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
