"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { EnvelopeTile3D } from "./EnvelopeTile3D";
import {
  LANGUAGES,
  type Language,
  type Token,
  tokenize,
} from "./integrate-samples";

const TOKEN_CLASS: Record<Token["kind"], string> = {
  plain: "text-white/90",
  string: "text-[#c4a5fd]",
  comment: "text-white/30",
  keyword: "text-white/45",
};

function LanguageGlyph({ language }: { language: Language }) {
  if (language.id === "node") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5L12 2.5z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <text
          x="12"
          y="15"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fontFamily="ui-monospace, monospace"
          fill="currentColor"
        >
          JS
        </text>
      </svg>
    );
  }
  return (
    <span
      className={`font-mono font-bold tracking-tight ${language.glyph.length > 3 ? "text-[10px]" : "text-sm"} ${language.id === "go" ? "italic" : ""}`}
    >
      {language.glyph}
    </span>
  );
}

export function EmailsIntegrate() {
  const [languageId, setLanguageId] = useState("node");
  const [variantId, setVariantId] = useState("node");
  const [copied, setCopied] = useState(false);

  const language =
    LANGUAGES.find((item) => item.id === languageId) ?? LANGUAGES[0];
  const variant =
    language?.variants.find((item) => item.id === variantId) ??
    language?.variants[0];
  if (!language || !variant) return null;

  const lines = variant.code.split("\n");

  function selectLanguage(next: Language) {
    setLanguageId(next.id);
    setVariantId(next.variants[0]?.id ?? "");
    setCopied(false);
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="relative w-full overflow-hidden bg-black py-24 text-white lg:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[#A855F7]/[0.08] blur-[100px]"
      />
      <div className="marketing-container relative flex flex-col items-center">
        <EnvelopeTile3D />

        <h2 className="mt-12 text-center font-clash text-[clamp(2.5rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-tight">
          Integrate{" "}
          <span className="bg-gradient-to-b from-[#d8b4fe] to-[#9333ea] bg-clip-text text-transparent">
            anywhere
          </span>
        </h2>
        <p className="mt-5 max-w-xl text-center text-base leading-relaxed text-white/55 sm:text-lg">
          One HTTP request or a standard SMTP relay. It fits into whatever
          language and framework you already use, with no SDK to install.
        </p>

        {/* Language tiles */}
        <div
          role="tablist"
          aria-label="Languages"
          className="mt-14 flex w-full justify-start gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:justify-center sm:gap-4"
        >
          {LANGUAGES.map((item) => {
            const selected = item.id === language.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectLanguage(item)}
                className="group flex shrink-0 flex-col items-center gap-3"
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl border transition-all ${
                    selected
                      ? "border-[#A855F7]/50 bg-[#A855F7]/[0.08] text-[#d8b4fe] shadow-[0_0_24px_-6px_rgba(168,85,247,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-white/[0.02] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:border-white/25 group-hover:text-white/85"
                  }`}
                >
                  <LanguageGlyph language={item} />
                </span>
                <span
                  className={`text-sm transition-colors ${selected ? "text-white" : "text-white/45 group-hover:text-white/75"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Code window */}
        <div className="relative mt-12 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#070708] shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5">
            <div
              role="tablist"
              aria-label={`${language.label} variants`}
              className="flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]"
            >
              {language.variants.map((item) => {
                const selected = item.id === variant.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setVariantId(item.id);
                      setCopied(false);
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      selected
                        ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    <span
                      className={`grid size-4 place-items-center rounded border font-mono text-[8px] ${
                        selected
                          ? "border-[#A855F7]/60 text-[#d8b4fe]"
                          : "border-white/20 text-white/50"
                      }`}
                    >
                      {item.label.charAt(0).toUpperCase()}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden font-mono text-xs text-white/30 sm:inline">
                {variant.file}
              </span>
              <button
                type="button"
                onClick={() => copy(variant.code)}
                aria-label="Copy code"
                className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-[30rem] overflow-x-auto px-2 py-5 sm:px-4">
            <pre className="font-mono text-[13px] leading-[1.6rem]">
              <code>
                {lines.map((line, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: static code lines
                    key={`${variant.id}-${index}`}
                    className="grid grid-cols-[2.5rem_1fr]"
                  >
                    <span className="select-none pr-5 text-right text-white/25">
                      {index + 1}
                    </span>
                    <span className="whitespace-pre">
                      {line
                        ? tokenize(line).map((token, tokenIndex) => (
                            <span
                              // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                              key={tokenIndex}
                              className={TOKEN_CLASS[token.kind]}
                            >
                              {token.text}
                            </span>
                          ))
                        : " "}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
