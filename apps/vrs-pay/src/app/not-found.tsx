import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <a href="/" aria-label="VRS Pay home" className="inline-block">
          <Logo />
        </a>
        <p className="eyebrow mt-12 text-brand-600">Error 404</p>
        <h1 className="mt-4 text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] font-light tracking-[-0.045em] text-ink">
          <span className="font-display block text-[1.1em]">This route</span>
          doesn't exist
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-mute">
          The page you're looking for moved, or never shipped.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink/85"
        >
          <ArrowLeft className="size-4" /> Back home
        </a>
      </div>
    </main>
  );
}
