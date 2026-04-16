use axum::extract::{FromRef, FromRequestParts};
use axum::http::request::Parts;
#[cfg(feature = "require-auth")]
use loco_rs::prelude::auth;
use loco_rs::{app::AppContext, errors::Error};

/// The PID used for the anonymous user when the `require-auth` feature is disabled.
pub const ANONYMOUS_PID: &str = "00000000-0000-0000-0000-000000000000";

/// A minimal claims struct exposing the user PID.
///
/// Mirrors the interface of `auth::jwt::UserClaims` (which has a private `exp`
/// field and therefore cannot be constructed outside of loco-rs), so that all
/// handler bodies can use `auth.claims.pid` unchanged regardless of whether the
/// `require-auth` feature is active.
pub struct Claims {
    pub pid: String,
}

/// Axum extractor that enforces JWT authentication when the `require-auth`
/// feature is enabled, and becomes a no-op (always succeeds with the anonymous
/// PID) when the feature is disabled.
///
/// Use `MaybeAuth` in place of `auth::JWT` in every handler signature.
pub struct MaybeAuth {
    pub claims: Claims,
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
        Ok(Self {
            claims: Claims {
                pid: jwt.claims.pid,
            },
        })
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
            claims: Claims {
                pid: ANONYMOUS_PID.to_string(),
            },
        })
    }
}
