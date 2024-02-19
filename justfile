default:
  @just --list

lint: rust-lint

rust-lint:
  cargo clippy --all-features -- -D warnings -W clippy::pedantic -W clippy::nursery -W rust-2018-idioms


run: frontend-build
  cargo loco start

pg-start:
 docker-compose up -d

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

# Seed the database on a given environment
pg-seed environment:
  cargo loco task --environment {{environment}} seed_data

# Reset the database on a given environment
pg-reset environment:
  cargo loco db reset --environment {{environment}}

frontend-dev: frontend-install
  cd frontend; npm run dev

frontend-build: frontend-install
  cd frontend; npm run build

frontend-install:
  cd frontend; npm install

# login to application as jim. requires seeding first.
login:
  http post localhost:3000/api/auth/login email=jim@example.com password=rubberduck
