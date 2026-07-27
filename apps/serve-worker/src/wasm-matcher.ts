import matcherModule from "./routing-matcher.wasm";

declare const Bun: { file(path: string): Blob } | undefined;

interface MatcherExports extends WebAssembly.Exports {
  alloc(length: number): number;
  dealloc(pointer: number, length: number): void;
  matches_pattern(pointer: number, length: number): number;
  memory: WebAssembly.Memory;
}

async function loadModule(): Promise<WebAssembly.Module> {
  if (matcherModule instanceof WebAssembly.Module) return matcherModule;
  if (typeof Bun === "undefined") {
    throw new Error("Routing matcher file loader is unavailable");
  }
  return WebAssembly.compile(await Bun.file(matcherModule).arrayBuffer());
}

function matcherExports(module: WebAssembly.Module): MatcherExports {
  const exports = new WebAssembly.Instance(module).exports;
  if (
    !(exports.memory instanceof WebAssembly.Memory) ||
    typeof exports.alloc !== "function" ||
    typeof exports.dealloc !== "function" ||
    typeof exports.matches_pattern !== "function"
  ) {
    throw new Error("Invalid routing matcher WASM module");
  }
  return exports as MatcherExports;
}

const MATCHER = matcherExports(await loadModule());
const ENCODER = new TextEncoder();

export function matchesRoute(pattern: string, pathname: string): boolean {
  const input = ENCODER.encode(JSON.stringify([pattern, pathname]));
  const pointer = MATCHER.alloc(input.byteLength);
  try {
    new Uint8Array(MATCHER.memory.buffer, pointer, input.byteLength).set(input);
    return MATCHER.matches_pattern(pointer, input.byteLength) === 1;
  } finally {
    MATCHER.dealloc(pointer, input.byteLength);
  }
}
