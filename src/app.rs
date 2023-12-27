use std::path::Path;

use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Hooks},
    boot::{create_app, BootResult, StartMode},
    controller::AppRoutes,
    db::{self, truncate_table},
    task::Tasks,
    worker::{AppWorker, Processor},
    Result,
};
use migration::Migrator;
use sea_orm::{ConnectionTrait, DatabaseConnection, DbBackend, Statement};

use crate::{
    controllers,
    models::_entities::{
        ingredients, ingredients_in_shoppinglists, notes, quantities, shoppinglists, users,
    },
    tasks,
    workers::downloader::DownloadWorker,
};

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(mode: StartMode, environment: &str) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment).await
    }

    fn routes() -> AppRoutes {
        AppRoutes::with_default_routes()
            .add_route(controllers::ingredients::routes())
            .prefix("/api")
            .add_route(controllers::notes::routes())
            .add_route(controllers::auth::routes())
            .add_route(controllers::user::routes())
    }

    fn connect_workers<'a>(p: &'a mut Processor, ctx: &'a AppContext) {
        p.register(DownloadWorker::build(ctx));
    }

    fn register_tasks(tasks: &mut Tasks) {
        tasks.register(tasks::seed::SeedData);
    }

    async fn truncate(db: &DatabaseConnection) -> Result<()> {
        truncate_table(db, users::Entity).await?;
        truncate_table(db, notes::Entity).await?;
        truncate_table(db, ingredients_in_shoppinglists::Entity).await?;
        truncate_table(db, quantities::Entity).await?;
        truncate_table(db, ingredients::Entity).await?;
        truncate_table(db, shoppinglists::Entity).await?;
        Ok(())
    }

    async fn seed(db: &DatabaseConnection, base: &Path) -> Result<()> {
        db::seed::<users::ActiveModel>(db, &base.join("users.yaml").display().to_string()).await?;
        db::seed::<notes::ActiveModel>(db, &base.join("notes.yaml").display().to_string()).await?;
        db::seed::<quantities::ActiveModel>(
            db,
            &base.join("quantities.yaml").display().to_string(),
        )
        .await?;
        db::seed::<ingredients::ActiveModel>(
            db,
            &base.join("ingredients.yaml").display().to_string(),
        )
        .await?;
        db::seed::<shoppinglists::ActiveModel>(
            db,
            &base.join("shoppinglists.yaml").display().to_string(),
        )
        .await?;
        db::seed::<ingredients_in_shoppinglists::ActiveModel>(
            db,
            &base
                .join("ingredients_in_shoppinglists.yaml")
                .display()
                .to_string(),
        )
        .await?;

        for table in [
            "users",
            "notes",
            "ingredients_in_shoppinglists",
            "quantities",
            "ingredients",
            "shoppinglists",
        ] {
            db.query_one(Statement::from_string(
                DbBackend::Postgres,
                format!("SELECT setval('{table}_id_seq', (SELECT MAX(id) FROM {table}))"),
            ))
            .await?;
        }

        Ok(())
    }
}
