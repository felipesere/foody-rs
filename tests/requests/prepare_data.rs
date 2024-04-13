use axum::http::{HeaderName, HeaderValue};
use foody::models::users::RegisterParams;
use foody::{models::users, views::auth::LoginResponse};
use loco_rs::{app::AppContext, TestServer};

const USER_EMAIL: &str = "test@loco.com";
const USER_PASSWORD: &str = "1234";

pub struct LoggedInUser {
    pub user: users::Model,
    pub token: String,
}

pub async fn authenticated(request: &mut TestServer, ctx: &AppContext) {
    let logged_in_user = init_user_login(request, ctx).await;

    let (auth_key, auth_value) = auth_header(&logged_in_user.token);

    request.add_header(auth_key, auth_value)
}

pub async fn init_user_login(request: &TestServer, ctx: &AppContext) -> LoggedInUser {
    let register_params = RegisterParams {
        name: "loco".to_string(),
        email: USER_EMAIL.to_string(),
        password: USER_PASSWORD.to_string(),
    };

    // Creating a new user
    let _user = users::Model::create_with_password(&ctx.db, &register_params)
        .await
        .expect("To register a new user");

    let response = request
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        }))
        .await;

    let login_response: LoginResponse = serde_json::from_str(&response.text()).unwrap();

    LoggedInUser {
        user: users::Model::find_by_email(&ctx.db, USER_EMAIL)
            .await
            .unwrap(),
        token: login_response.token,
    }
}

pub fn auth_header(token: &str) -> (HeaderName, HeaderValue) {
    let auth_header_value = HeaderValue::from_str(&format!("Bearer {}", &token)).unwrap();

    (HeaderName::from_static("authorization"), auth_header_value)
}
