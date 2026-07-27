export interface HonoApplication {
  fetch(request: Request): Response | Promise<Response>;
}

export interface AdapterOptions {
  hostname?: string;
  port?: number;
}

export function serveHono(app: HonoApplication, options: AdapterOptions = {}) {
  return Bun.serve({
    fetch: (request) => app.fetch(request),
    hostname: options.hostname ?? process.env.HOST ?? "0.0.0.0",
    port: options.port ?? Number(process.env.PORT ?? 8080),
  });
}
