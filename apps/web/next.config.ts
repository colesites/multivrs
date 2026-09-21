import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: { default: sanity },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Workspace packages ship TypeScript source (exports point at ./src/*.ts),
  // so Next must transpile them rather than expect prebuilt JS.
  transpilePackages: [
    "@multivrs/build-utils",
    "@multivrs/config",
    "@multivrs/client",
    "@multivrs/error-utils",
  ],
};

export default nextConfig;
