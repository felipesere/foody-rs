default:
  @just --list

lint: frontend-lint
fmt: frontend-fmt
test: frontend-test


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

frontend-dev: frontend-install # gql-ts-generate
  cd frontend; npm run dev

frontend-build: frontend-install
  cd frontend; npm run build

frontend-install:
  cd frontend; npm install

login-ghcr:
  docker login ghcr.io -u felipesere -p $(op read op://Homelab/"Github PAT Push Registry"/password)

publish: login-ghcr
  docker build . -t ghcr.io/felipesere/foody:latest
  docker push ghcr.io/felipesere/foody:latest
