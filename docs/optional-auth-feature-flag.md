# Optional Auth: `require-auth` Cargo Feature Flag

## Core Idea

Rather than `#[cfg]` on individual function parameters (which Rust doesn't support), we introduce a single `MaybeAuth` extractor type in a new `src/auth_gate.rs` file. When `require-auth` is enabled (the default), it delegates to `auth::JWT` and behaves identically to today. When disabled, it succeeds unconditionally with a placeholder identity. Every handler changes `auth: auth::JWT` → `auth: MaybeAuth` — one mechanical find/replace — and **no handler bodies need to change**.

Build without auth: `cargo build --no-default-features`

---

## Step 1 — `Cargo.toml`: Add the feature

```toml
[features]
default = ["require-auth"]
require-auth = []
```

---

## Step 2 — New file `src/auth_gate.rs`: The `MaybeAuth` extractor

Two `impl FromRequestParts` blocks gated by `#[cfg(feature = "require-auth")]` / `#[cfg(not(...))]`. The no-auth branch returns a dummy `UserClaims` with a fixed anonymous PID (`00000000-0000-0000-0000-000000000000`). Check the exact `UserClaims` fields from the loco-rs source before implementing.

```rust
// src/auth_gate.rs

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use loco_rs::{app::AppContext, controller::extractor::auth, errors::Error};
use axum::extract::FromRef;

pub const ANONYMOUS_PID: &str = "00000000-0000-0000-0000-000000000000";

#[derive(Debug)]
pub struct MaybeAuth {
    pub claims: auth::jwt::UserClaims,
}

#[cfg(feature = "require-auth")]
impl<S> FromRequestParts<S> for MaybeAuth
where
    AppContext: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Error> {
        let jwt = auth::JWT::from_request_parts(parts, state).await?;
        Ok(Self { claims: jwt.claims })
    }
}

#[cfg(not(feature = "require-auth"))]
impl<S> FromRequestParts<S> for MaybeAuth
where
    AppContext: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(_parts: &mut Parts, _state: &S) -> Result<Self, Error> {
        Ok(Self {
            claims: auth::jwt::UserClaims {
                pid: ANONYMOUS_PID.to_string(),
                // fill remaining fields — check loco-rs source for full struct definition
            },
        })
    }
}
```

Expose it via `pub mod auth_gate;` in `src/lib.rs`.

---

## Step 3 — Mechanical replacement in 7 controller files

Add `use crate::auth_gate::MaybeAuth;` and replace all 41 occurrences of `auth: auth::JWT` / `_auth: auth::JWT` with `auth: MaybeAuth`.

| File | Occurrences |
|---|---|
| `src/controllers/shoppinglists.rs` | 15 |
| `src/controllers/recipes.rs` | 8 |
| `src/controllers/mealplans.rs` | 9 |
| `src/controllers/ingredients.rs` | 5 |
| `src/controllers/ailes.rs` | 2 |
| `src/controllers/storage.rs` | 1 |
| `src/controllers/graphql.rs` | 1 (special case, see Step 5) |

Handler bodies require **zero changes** — `auth.claims.pid` works identically on `MaybeAuth`.

---

## Step 4 — `src/app.rs`: Gate auth + user routes

```rust
fn routes(_ctx: &AppContext) -> AppRoutes {
    let mut routes = AppRoutes::with_default_routes()
        .add_route(controllers::recipes::routes())
        .add_route(controllers::ingredients::routes())
        .add_route(controllers::shoppinglists::routes())
        .add_route(controllers::mealplans::routes())
        .add_route(controllers::ailes::routes())
        .add_route(controllers::storage::routes())
        .add_route(controllers::graphql::routes());

    #[cfg(feature = "require-auth")]
    {
        routes = routes
            .add_route(controllers::auth::routes())   // POST /api/auth/login
            .add_route(controllers::user::routes());  // GET /api/user/current
    }

    routes
}
```

`auth.rs` and `user.rs` need no changes — they just won't be routed when auth is disabled.

---

## Step 5 — Seed an anonymous user (for no-auth mode)

All handlers call `users::Model::find_by_pid(&ctx.db, &auth.claims.pid)`. With auth disabled, `claims.pid` will be `ANONYMOUS_PID`. A matching user row must exist in the database.

Seed one static user with `pid = ANONYMOUS_PID`. This is harmless in auth mode since no real JWT would ever carry that PID.

This also handles `graphql.rs`, which is the one handler that actually *uses* the resolved user (passes it into the GraphQL schema context as `.data(user)`).

---

## Step 6 — Tests: one change to `prepare_data.rs`

Make `authenticated()` a no-op when the feature is off — all tests that call it continue to work unchanged:

```rust
pub async fn authenticated(request: &mut TestServer, ctx: &AppContext) {
    #[cfg(feature = "require-auth")]
    {
        let logged_in_user = init_user_login(request, ctx).await;
        let (auth_key, auth_value) = auth_header(&logged_in_user.token);
        request.add_header(auth_key, auth_value);
    }
}
```

Also gate the `can_get_current_user` test in `tests/requests/user.rs` since the route won't be registered:

```rust
#[cfg(feature = "require-auth")]
#[tokio::test]
#[serial]
async fn can_get_current_user() { ... }
```

---

## Step 7 — Frontend: bypass the login gate

The `_auth` layout route (`frontend/src/routes/_auth.tsx`) redirects to `/login` when no token is found in localStorage. In no-auth mode we skip that redirect and return an empty string as the dummy token (the backend ignores the `Authorization` header entirely).

Control is via a Vite env variable set at build time:

```
VITE_REQUIRE_AUTH=false
```

In `_auth.tsx`:

```ts
const REQUIRE_AUTH = import.meta.env.VITE_REQUIRE_AUTH !== "false";

beforeLoad: ({ context, location }) => {
  const token = context.token;
  if (REQUIRE_AUTH && !token) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
  return { token: token ?? "" };
}
```

All child routes receive `token: string` as before, so no downstream API calls need to change. The empty-string token is sent in the `Authorization: Bearer ` header but the no-auth backend ignores it.

---

## Step 8 — CI

Add a job that builds and tests with `--no-default-features` to catch regressions in the no-auth path:

```yaml
- name: Test (no-auth)
  run: cargo test --no-default-features
```

---

## File Change Summary (including frontend)

| File | Change |
|---|---|
| `Cargo.toml` | Add `[features]` section |
| `src/auth_gate.rs` | **New** — `MaybeAuth` extractor (cfg-gated impls) |
| `src/lib.rs` | Add `pub mod auth_gate;` |
| `src/app.rs` | Gate `auth` + `user` route registration with `#[cfg]` |
| `src/controllers/recipes.rs` | Replace 8 `auth::JWT` params with `MaybeAuth` |
| `src/controllers/ingredients.rs` | Replace 5 `auth::JWT` params with `MaybeAuth` |
| `src/controllers/shoppinglists.rs` | Replace 15 `auth::JWT` params with `MaybeAuth` |
| `src/controllers/mealplans.rs` | Replace 9 `auth::JWT` params with `MaybeAuth` |
| `src/controllers/ailes.rs` | Replace 2 `auth::JWT` params with `MaybeAuth` |
| `src/controllers/storage.rs` | Replace 1 `auth::JWT` param with `MaybeAuth` |
| `src/controllers/graphql.rs` | Replace 1 `auth::JWT` param with `MaybeAuth` |
| `tests/requests/prepare_data.rs` | Gate body of `authenticated()` with `#[cfg(feature = "require-auth")]` |
| `tests/requests/user.rs` | Gate `can_get_current_user` test with `#[cfg(feature = "require-auth")]` |
| `frontend/src/routes/_auth.tsx` | Gate redirect to `/login` behind `VITE_REQUIRE_AUTH !== "false"` |

---

## Pitfalls to Watch

- **`UserClaims` construction**: Check the loco-rs source for all required fields. Look at `~/.cargo/registry/src/.../loco-rs-*/src/auth/jwt.rs`.
- **Anonymous user must be seeded**: If `find_by_pid` returns `EntityNotFound`, every handler will error in no-auth mode even though auth is disabled.
- **GraphQL user data**: The GraphQL resolvers access the user via `ctx.data_unchecked::<users::Model>()` — the anonymous user seed handles this. Verify no resolver panics if the user has no real data.
