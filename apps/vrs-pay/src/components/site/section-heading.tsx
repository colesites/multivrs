import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  /** Set in Instrument Serif italic, on its own line. */
  lead: ReactNode;
  rest: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  lead,
  rest,
  children,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "reveal",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl",
        className,
      )}
    >
      <p className="eyebrow text-brand-600">{eyebrow}</p>
      <h2
        id={id}
        className="mt-4 text-[clamp(2.3rem,5vw,3.9rem)] leading-[0.98] font-light tracking-[-0.045em] text-balance text-ink"
      >
        <span className="font-display block text-[1.1em] tracking-[-0.015em]">
          {lead}
        </span>
        <span className="block">{rest}</span>
      </h2>
      {children && (
        <p
          className={cn(
            "mt-5 text-[16px] leading-relaxed text-pretty text-mute sm:text-[17px]",
            align === "center" && "mx-auto max-w-xl",
          )}
        >
          {children}
        </p>
      )}
    </div>
  );
}
