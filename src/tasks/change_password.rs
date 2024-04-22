use std::collections::BTreeMap;

use loco_rs::prelude::*;

use crate::models::users::{users, Entity as Users};
use rpassword;

pub struct ChangePassword;
#[async_trait]
impl Task for ChangePassword {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "change_password".to_string(),
            detail: "Change email of user based on ID".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, vars: &BTreeMap<String, String>) -> Result<()> {
        let user_id = vars
            .get("id")
            .ok_or_else(|| Error::Message("ID missing to update password".to_string()))?
            .parse::<i32>()
            .map_err(|_| Error::Message("ID not a number".to_string()))?;

        let user = Users::find_by_id(user_id).one(&app_context.db).await?;

        let Some(user) = user else {
            return Err(Error::Message(format!(
                "Did not find user for ID '{user_id}'",
            )));
        };
        println!(
            "About to update the password of '{}'({}):",
            user.name, user.email
        );
        let password = rpassword::read_password().unwrap();
        let user: users::ActiveModel = user.into();

        user.reset_password(&app_context.db, &password)
            .await
            .map(|_| ())
            .map_err(|e| Error::Model(e))
    }
}
