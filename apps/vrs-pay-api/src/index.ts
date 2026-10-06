import { createApp } from "./app";
import { DEFAULT_PORT } from "./constants";
import { createDevDependencies } from "./dev-dependencies";

const app = createApp(await createDevDependencies(process.env));

export default {
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  fetch: app.fetch,
};
