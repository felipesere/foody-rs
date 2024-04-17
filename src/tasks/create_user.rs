use std::collections::BTreeMap;

use loco_rs::prelude::*;

use crate::models;
use crate::models::users::RegisterParams;

pub struct CreateUser;
#[async_trait]
impl Task for CreateUser {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "create_user".to_string(),
            detail: "Task generator".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, vars: &BTreeMap<String, String>) -> Result<()> {
        tracing::info!("about to do a thing...");
        let name = vars.get("name").unwrap();
        let email = vars.get("email").unwrap();
        let password = vars.get("password").unwrap();
        let user = models::users::Model::create_with_password(
            &app_context.db,
            &RegisterParams {
                email: email.to_string(),
                password: password.to_string(),
                name: name.to_string(),
            },
        )
        .await?;

        println!("Create new user {}", user.name);

        Ok(())
    }
}
