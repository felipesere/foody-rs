default:
  @just --list

lint: rust-lint frontend-lint
fmt: rust-fmt frontend-fmt
test: rust-test frontend-test

rust-lint:
  cargo clippy --all-features -- -D warnings -W clippy::nursery -W rust-2018-idioms

rust-fmt:
  cargo fmt

rust-test:
  cargo test

frontend-lint:
  cd frontend; npx biome check --write .
  cd frontend; npx biome check .
  cd frontend; npm run tsc

frontend-fmt:
  cd frontend; npm run fmt

frontend-test:
  cd frontend; npm run test

run: frontend-build run-backend

run-backend:
  cargo loco start

pg-start:
 docker compose up -d

# Run migration:
# environment is one of `dev` or `test`
# direction is one `up` or `down`
pg-migrate environment direction:
  #!/usr/bin/env bash
  set -euxo pipefail
  if [ "{{environment}}" == "development" ]; then
    PORT=5432
  else
    PORT=5433
  fi
  cd migration
  DATABASE_URL=postgres://loco:loco@localhost:${PORT}/foody_{{environment}} cargo run -- {{direction}}

pg-reseed environment: (pg-reset environment) (pg-seed environment)

# Seed the database on a given environment
pg-seed environment:
  cargo loco task --environment {{environment}} seed_data

# Reset the database on a given environment
pg-reset environment:
  cargo loco db reset --environment {{environment}}

# Launch the proxy to the fly.io Postgres DB
fly-proxy:
  fly proxy 5555:5432 -a foody-v2-db

# Read the 1Password secrets to connect to the PostgresDB on fly.io
fly-proxy-db-url:
  #!/usr/bin/env bash
  echo "export DATABASE_URL=postgres://$(op read op://Personal/foody\ db\ v2/username):$(op read op://Personal/foody\ db\ v2/operator)@localhost:5555/foody_v2";

frontend-dev: frontend-install
  cd frontend; npm run dev

frontend-build: frontend-install
  cd frontend; npm run build

frontend-install:
  cd frontend; npm install

# login to application as jim. requires seeding first.
login:
  http post localhost:5150/api/auth/login email=jim@example.com password=rubberduck
