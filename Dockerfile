# -- Building the node assets --
FROM cgr.dev/chainguard/node AS node-builder
WORKDIR /app
COPY --chown=node:node frontend .
RUN npm install
ENV NODE_ENV=production
RUN npm run build

# -- Building the rust app
FROM cgr.dev/chainguard/rust AS rust-builder

WORKDIR /usr/src/
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
