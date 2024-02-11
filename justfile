default:
  @just --list

run: frontend-build
  cargo loco start

frontend-build: frontend-install
  cd frontend; npm run build

frontend-install:
  cd frontend; npm install

# login to application as jim. requires seeding first.
login:
  http post localhost:3000/api/auth/login email=jim@example.com password=rubberduck
