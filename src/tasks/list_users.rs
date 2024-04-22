use std::collections::BTreeMap;

use crate::models::users::Entity as Users;
use loco_rs::prelude::*;

pub struct ListUsers;

#[async_trait]
impl Task for ListUsers {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "list_users".to_string(),
            detail: "Task generator".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, _vars: &BTreeMap<String, String>) -> Result<()> {
        let users = Users::find().all(&app_context.db).await?;

        for user in users {
            println!("{}\t{}\t{}\t", user.id, user.name, user.email)
        }
        Ok(())
    }
}
