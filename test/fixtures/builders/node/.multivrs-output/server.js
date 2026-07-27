Bun.serve({ port: Number(process.env.PORT ?? 8080), fetch: () => new Response("node") });
