# Foody

Recipe & shopping-list app. Rails 8 JSON API (SQLite, OIDC login via Pocket ID)
that also serves the built React SPA — one same-origin image, no separate DB.

## Run it

```sh
docker compose up --build   # → http://localhost:8080
```

Needs a `.env` with `RAILS_MASTER_KEY` (from `backend/config/master.key`); add the
`OIDC_*` values to exercise real login. First boot has no users — create one:

```sh
docker compose exec app bin/rails 'foody:bootstrap[Sere Family,you@example.com,You]'
```

## Develop

- `frontend/` — React 19 + Vite + TanStack. `npm run dev`, `npm test`.
- `backend/` — Rails 8 + RSpec. `bin/rails server`, `just test`.
