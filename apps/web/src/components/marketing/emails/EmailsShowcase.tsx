import { MailboxVisual } from "@/components/marketing/services/MailboxVisual";

/**
 * The framed panel directly under the hero: a glowing top edge, a short
 * statement, and the mailbox visual rising out of it (cut off and faded).
 */
export function EmailsShowcase() {
  return (
    <section className="relative w-full bg-black pb-8 text-white">
      <div className="marketing-container">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-t-[2rem] border-x border-t border-white/10 bg-gradient-to-b from-white/[0.035] via-transparent to-transparent px-4 pt-16 sm:px-10 lg:pt-20">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-40 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.07] blur-3xl"
          />

          <p className="mx-auto max-w-md text-center text-base leading-relaxed text-white/55 sm:text-lg">
            Every message you send and receive,
            <br className="hidden sm:block" /> in one control plane.
          </p>

          <div className="relative mx-auto mt-12 h-[300px] max-w-4xl overflow-hidden sm:h-[380px] lg:mt-14 lg:h-[440px]">
            <div className="dark [&>div]:lg:max-w-none">
              <MailboxVisual />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
