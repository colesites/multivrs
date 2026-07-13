import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
