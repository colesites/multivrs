"use client";

import { CheckCircle2, type LucideIcon } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";

type Feature = { text: string; icon?: LucideIcon };

type Props = {
  action: string;
  description: string;
  eyebrow?: string;
  featureIntro?: string;
  features: Feature[];
  actionDisabled?: boolean;
  onAction: () => void;
  price: string;
  suffix?: string;
  title: string;
  variant?: "default" | "featured";
};

export function PricingCard({
  action,
  description,
  eyebrow,
  featureIntro,
  features,
  actionDisabled = false,
  onAction,
  price,
  suffix,
  title,
  variant = "default",
}: Props) {
  const featured = variant === "featured";
  return (
    <div
      className={`relative flex flex-col justify-between p-8 lg:p-10 ${
        featured ? "bg-foreground/[0.015]" : "bg-foreground/[0.005]"
      }`}
    >
      <div>
        <div className="flex min-h-[170px] flex-col justify-between lg:h-[210px]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground/90">
              {title}
            </h3>
            {eyebrow ? (
              <span className="border border-foreground/40 bg-foreground/5 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/90">
                {eyebrow}
              </span>
            ) : null}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-normal tracking-tight text-foreground lg:text-5xl">
                {price}
              </span>
              {suffix ? (
                <span className="font-mono text-sm text-muted-foreground">
                  {suffix}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <div className="my-6 border-t border-border" />
        {featureIntro ? (
          <p className="mb-5 text-sm text-muted-foreground">{featureIntro}</p>
        ) : null}
        <ul className="space-y-4 text-sm text-foreground/85">
          {features.map(({ text, icon: Icon }) => (
            <li key={text} className="group/feature flex items-center gap-3.5">
              {Icon ? (
                <Icon className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out motion-safe:group-hover/feature:-translate-y-0.5 motion-safe:group-hover/feature:rotate-6 motion-safe:group-hover/feature:scale-110" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out motion-safe:group-hover/feature:-translate-y-0.5 motion-safe:group-hover/feature:scale-110" />
              )}
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-10 pt-2">
        <SpecularButton
          size="md"
          radius={9999}
          tint={featured ? "#ffffff" : undefined}
          tintOpacity={featured ? 1 : 0}
          baseColor={featured ? "#ffffff" : "#1c1c1c"}
          lineColor="#ffffff"
          textColor={featured ? "#000000" : "currentColor"}
          className="w-full justify-center text-sm font-medium"
          disabled={actionDisabled}
          onClick={onAction}
        >
          {action}
        </SpecularButton>
      </div>
    </div>
  );
}
