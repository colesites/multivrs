FROM docker.io/oven/bun:1.3.5-debian

RUN apt-get update \
  && apt-get install --yes --no-install-recommends nodejs python3 ruby ruby-bundler ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --create-home --uid 10001 runtime \
  && mkdir -p /runtime \
  && chown runtime:runtime /runtime

USER runtime
WORKDIR /runtime
ENTRYPOINT ["sleep", "infinity"]
