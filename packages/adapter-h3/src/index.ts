export type H3WebHandler = (request: Request) => Response | Promise<Response>;

export interface AdapterOptions {
  hostname?: string;
  port?: number;
}

export function serveH3(handler: H3WebHandler, options: AdapterOptions = {}) {
  return Bun.serve({
    fetch: handler,
    hostname: options.hostname ?? process.env.HOST ?? "0.0.0.0",
    port: options.port ?? Number(process.env.PORT ?? 8080),
  });
}
