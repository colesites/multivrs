/**
 * The Multivrs "Peak M" brand mark — an angular M drawn as two peaks, echoing
 * the cosmic/triangle theme. Stroke uses `currentColor`, so set the color via a
 * text-* class on the element. Matches `public/logo.svg` / `favicon.ico`.
 */
export function MultivrsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M14 78 L38 26 L50 52 L62 26 L86 78"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
