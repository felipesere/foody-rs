default:
  @just --list

login-ghcr:
  docker login ghcr.io -u felipesere -p $(op read op://Homelab/"Github PAT Push Registry"/password)

publish: login-ghcr
  docker build . -t ghcr.io/felipesere/foody:latest
  docker push ghcr.io/felipesere/foody:latest
