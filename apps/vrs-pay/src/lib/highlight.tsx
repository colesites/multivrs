import type { ReactNode } from "react";

/**
 * A tiny TS/TSX highlighter that runs during SSR — the page ships colored
 * <span>s and zero highlighting JavaScript. It only needs to handle the
 * handful of snippets on the landing page, not arbitrary code.
 */
const TOKEN =
  /(\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|default|const|let|await|async|function|return|new|switch|case|break|if|else|null|true|false)\b|\b(\d[\d_]*)\b|([A-Za-z_$][\w$]*)(?=\s*\()|([{}()[\];,.:=?])/g;

const CLASS = [
  "tok-com",
  "tok-str",
  "tok-tag",
  "tok-kw",
  "tok-num",
  "tok-fn",
  "tok-pun",
];

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(code.slice(last, start));
    const group = m.slice(1).findIndex((g) => g !== undefined);
    out.push(
      <span key={start} className={CLASS[group]}>
        {m[0]}
      </span>,
    );
    last = start + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
