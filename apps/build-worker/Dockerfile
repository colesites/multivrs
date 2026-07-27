FROM docker.io/library/rust:1.90-bookworm AS cli-builder

ENV CARGO_HTTP_TIMEOUT=600
ENV CARGO_HTTP_LOW_SPEED_LIMIT=1
WORKDIR /source
COPY Cargo.toml Cargo.lock ./
COPY packages/builder-core packages/builder-core
COPY packages/cli packages/cli
COPY packages/cli-auth packages/cli-auth
COPY packages/cli-config packages/cli-config
COPY packages/routing-matcher-wasm packages/routing-matcher-wasm
RUN cargo build --locked --release -p cli

FROM docker.io/cloudflare/sandbox:0.10.3

USER root
COPY --from=cli-builder /usr/local/cargo/bin /usr/local/cargo/bin
COPY --from=cli-builder /usr/local/rustup /usr/local/rustup
COPY --from=cli-builder /source/target/release/multivrs /usr/local/bin/multivrs
ENV CARGO_HOME=/usr/local/cargo
ENV RUSTUP_HOME=/usr/local/rustup
ENV PATH=/root/.bun/bin:/usr/local/cargo/bin:/usr/local/bin:/usr/bin:/bin
RUN rustup default stable && multivrs --version

WORKDIR /workspace
