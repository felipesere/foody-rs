use std::{fs::OpenOptions, io::Write};

use loco_rs::prelude::*;

use crate::graphql::schema;

pub struct GqlSchema;
#[async_trait]
impl Task for GqlSchema {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "gql-schema".to_string(),
            detail: "Dump the schema file to disk".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, vars: &task::Vars) -> Result<()> {
        let quiet = vars
            .cli_arg("quiet")
            .or_else(|_| vars.cli_arg("q"))
            .is_ok_and(|v| v == "true");

        let default_file = "schema.graphql".to_string();
        let output_file = vars
            .cli_arg("file")
            .or_else(|_| vars.cli_arg("f"))
            .unwrap_or(&default_file);
        let db = app_context.db.clone();
        let s = schema(db);

        let sdl = s.sdl();

        let mut file = OpenOptions::new()
            .write(true)
            .truncate(true)
            .open(output_file)?;
        file.write_all(sdl.as_bytes())?;

        if !quiet {
            println!("{sdl}");
        }
        Ok(())
    }
}
