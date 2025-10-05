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

gql-schema-generate:
  cargo run task gql-schema -- quiet:true

gql-ts-generate:
  cd frontend; npx graphql-codegen --config codegen.ts

frontend-lint: # gql-ts-generate
  cd frontend; npx biome check --write .
  cd frontend; npx biome check .
  cd frontend; npm run tsc

frontend-fmt:
  cd frontend; npm run fmt

frontend-test:
  cd frontend; npm run test

run: frontend-build run-backend

run-backend: gql-schema-generate
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

pg-snapshot environment:
  #!/usr/bin/env bash
  export PATH=/opt/homebrew/Cellar/libpq/18.0/bin:$PATH

  set -euxo pipefail
  
  mkdir -p db-snapshots
  if [ "{{environment}}" == "development" ]; then
    PORT=5432
  else
    PORT=5433
  fi
  pg_dump -d "postgres://loco:loco@localhost:${PORT}/foody_{{environment}}" -f db-snapshots/latest.sql

pg-snapshot-restore environment:
  #!/usr/bin/env bash
  export PATH=/opt/homebrew/Cellar/libpq/18.0/bin:$PATH

  set -euxo pipefail

  mkdir -p db-snapshots
  if [ "{{environment}}" == "development" ]; then
    PORT=5432
  else
    PORT=5433
  fi
  psql -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' "postgres://loco:loco@localhost:${PORT}/foody_{{environment}}"
  psql -f db-snapshots/latest.sql "postgres://loco:loco@localhost:${PORT}/foody_{{environment}}"


# Launch the proxy to the fly.io Postgres DB
fly-proxy:
  fly proxy 5555:5432 -a foody-v2-db

# Read the 1Password secrets to connect to the PostgresDB on fly.io
fly-proxy-db-url:
  #!/usr/bin/env bash
  echo "export DATABASE_URL=postgres://$(op read op://Personal/foody\ db\ v2/username):$(op read op://Personal/foody\ db\ v2/operator)@localhost:5555/foody_v2";

docker-build-image:
  # grab some of this from 1password!
  flyctl auth docker
  DOCKER_DEFAULT_PLATFORM=linux/amd64 docker build . -t registry.fly.io/foody-v2:$(git sha)

fly-deploy: docker-build-image
  docker push registry.fly.io/foody-v2:$(git sha)
  flyctl deploy --app foody-v2 --image registry.fly.io/foody-v2:$(git sha)

deploy: docker-build-image fly-deploy

frontend-dev: frontend-install # gql-ts-generate
  cd frontend; npm run dev

frontend-build: frontend-install
  cd frontend; npm run build

frontend-install:
  cd frontend; npm install

# login to application as jim. requires seeding first.
login-dev:
  http post localhost:5150/api/auth/login email=jim@example.com password=rubberduck

login-prod:
  http post https://foody.felipesere.com/api/auth/login email=$(op read "op://wnaq74cwoe7fp2i6swskavzafq/Foody prod login/username") password=$(op read "op://wnaq74cwoe7fp2i6swskavzafq/Foody prod login/password")
