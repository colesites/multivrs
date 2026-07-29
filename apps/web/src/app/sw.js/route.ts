/** Keeps Swift-Rust's former worker URL out of the dynamic username route. */
export function GET() {
  return new Response(null, {
    status: 410,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
