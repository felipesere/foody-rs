# syntax=docker/dockerfile:1
# check=error=true

# Combined production image for the cluster: builds the Vite frontend, bakes it
# into the Rails app's public/ dir, and serves API + OIDC + SPA same-origin via
# Thruster. Build from the REPO ROOT so both frontend/ and backend/ are in the
# context:
#
#   docker build -t foody .
#   docker run -d -p 8080:80 -e RAILS_MASTER_KEY=<backend/config/master.key> foody

# Must be declared before the first FROM so the Rails `FROM ruby:$RUBY_VERSION`
# below can interpolate it. Keep in sync with backend/.ruby-version.
ARG RUBY_VERSION=4.0.5

# ---------------------------------------------------------------------------
# 1. Build the JavaScript frontend -> /frontend/dist
# ---------------------------------------------------------------------------
FROM docker.io/library/node:22-slim AS frontend

WORKDIR /frontend

# Install against the lockfile first for cacheable layers.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Rails base (mirrors backend/Dockerfile)
# ---------------------------------------------------------------------------
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips sqlite3 && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# ---------------------------------------------------------------------------
# 2. Build gems and assemble the app
# ---------------------------------------------------------------------------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libvips libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile -j 1 --gemfile

COPY backend/ ./

# Bake the built SPA into public/ so Thruster serves it same-origin with the API.
COPY --from=frontend /frontend/dist ./public

RUN bundle exec bootsnap precompile -j 1 app/ lib/

# ---------------------------------------------------------------------------
# 3. Final runtime image
# ---------------------------------------------------------------------------
FROM base

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash

COPY --chown=rails:rails --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

USER 1000:1000

# Entrypoint runs db:prepare (creates/migrates the SQLite databases on first boot).
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
