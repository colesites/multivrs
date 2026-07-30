export interface PathPatternMatch {
  matched: boolean;
  params: Record<string, string>;
  remainder: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Matches safe path patterns without evaluating user-provided regular expressions. */
export function matchPathPattern(pattern: string, pathname: string): PathPatternMatch {
  const names: string[] = [];
  let expression = "";
  for (const segment of pattern.split("/")) {
    if (!segment) continue;
    if (segment === "*") {
      names.push("wildcard");
      expression += "/(.*)";
      continue;
    }
    if (segment.startsWith(":")) {
      const catchAll = segment.endsWith("*");
      const name = segment.slice(1, catchAll ? -1 : undefined);
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
        return { matched: false, params: {}, remainder: pathname };
      }
      names.push(name);
      expression += catchAll ? "/(.*)" : "/([^/]+)";
      continue;
    }
    expression += `/${escapeRegex(segment)}`;
  }
  const match = pathname.match(new RegExp(`^${expression || "/"}/?$`));
  if (!match) return { matched: false, params: {}, remainder: pathname };
  const params = Object.fromEntries(
    names.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? "")]),
  );
  const catchAll = names.at(-1);
  return {
    matched: true,
    params,
    remainder: catchAll ? `/${params[catchAll] ?? ""}`.replace(/\/$/, "") || "/" : "/",
  };
}

export function interpolatePath(template: string, params: Record<string, string>): string {
  return template.replace(/:([A-Za-z][A-Za-z0-9_]*)(\*)?/g, (_match, name: string) =>
    encodeURI(params[name] ?? ""),
  );
}
