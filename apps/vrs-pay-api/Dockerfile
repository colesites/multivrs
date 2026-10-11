# syntax=docker/dockerfile:1.7-labs
# Built from the repo root so the workspace packages resolve:
#   fly deploy --config apps/vrs-pay-api/fly.toml
FROM oven/bun:1.3.5-slim

# Prisma's migration engine links against OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Every workspace manifest so Bun can read the lockfile; only the API's
# dependencies are installed. The schema goes in first because the API's
# postinstall runs `prisma generate`.
COPY package.json bun.lock ./
COPY --parents apps/*/package.json packages/*/package.json ./
COPY apps/vrs-pay-api/prisma.config.ts apps/vrs-pay-api/
COPY apps/vrs-pay-api/prisma apps/vrs-pay-api/prisma
RUN bun install --filter vrs-pay-api

# Source is copied path by path so local .env files never reach the image.
COPY packages/typescript-config packages/typescript-config
COPY packages/vrs-pay-core/src packages/vrs-pay-core/src
COPY apps/vrs-pay-api/src apps/vrs-pay-api/src

WORKDIR /app/apps/vrs-pay-api

ENV NODE_ENV=production
EXPOSE 4300
CMD ["bun", "src/index.ts"]
