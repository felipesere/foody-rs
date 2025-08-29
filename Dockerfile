# -- Building the node assets --
FROM cgr.dev/chainguard/node AS node-builder
WORKDIR /app
COPY --chown=node:node frontend .
COPY --chown=node:node schema.graphql .
RUN npm install
ENV NODE_ENV=production
RUN npm run build

FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /usr/src/

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS rust-builder
COPY --from=planner /usr/src/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY . .
RUN cargo build --release

# -- runtime image
FROM cgr.dev/chainguard/glibc-dynamic:latest

COPY --from=node-builder /app/dist /usr/app/frontend/dist
COPY --from=rust-builder /usr/src/config /usr/app/config
COPY --from=rust-builder /usr/src/target/release/foody-cli /usr/app/foody-cli

WORKDIR /usr/app

ENV LOCO_ENV=production
ENTRYPOINT ["/usr/app/foody-cli", "start"]
