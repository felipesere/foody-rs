default:
  @just --list

# login to application as jim. requires seeding first.
login:
  http post localhost:3000/api/auth/login  email=jim@example.com password=rubberduck
