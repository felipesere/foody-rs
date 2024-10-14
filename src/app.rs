use std::{collections::HashMap, fs::File, path::Path};

use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Hooks},
    boot::{create_app, BootResult, StartMode},
    controller::AppRoutes,
    db::{self, truncate_table},
    environment::Environment,
    task::Tasks,
    Result,
};
use migration::Migrator;
use sea_orm::{
    ActiveModelBehavior, ActiveModelTrait, ConnectionTrait, DatabaseConnection, DbBackend,
    Statement,
};

use crate::{
    controllers,
    models::_entities::{
        self, ingredients, ingredients_in_recipes, ingredients_in_shoppinglists, quantities,
        recipes, shoppinglists, users,
    },
    tasks,
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

    async fn boot(mode: StartMode, environment: &Environment) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment).await
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes()
            .add_route(controllers::recipes::routes())
            .add_route(controllers::shoppinglists::routes())
            .add_route(controllers::ingredients::routes())
            .add_route(controllers::tags::routes())
            .add_route(controllers::mealplans::routes())
            .prefix("/api")
            .add_route(controllers::auth::routes())
            .add_route(controllers::user::routes())
    }

    async fn connect_workers(_ctx: &AppContext, _queue: &loco_rs::prelude::Queue) -> Result<()> {
        Ok(())
    }

    fn register_tasks(tasks: &mut Tasks) {
        tasks.register(tasks::tagger::Tagger);
        tasks.register(tasks::list_users::ListUsers);
        tasks.register(tasks::change_password::ChangePassword);
        tasks.register(tasks::create_user::CreateUser);
        tasks.register(tasks::seed::SeedData);
    }

    async fn truncate(db: &DatabaseConnection) -> Result<()> {
        truncate_table(db, users::Entity).await?;
        truncate_table(db, ingredients_in_shoppinglists::Entity).await?;
        truncate_table(db, ingredients_in_recipes::Entity).await?;
        truncate_table(db, quantities::Entity).await?;
        truncate_table(db, ingredients::Entity).await?;
        truncate_table(db, shoppinglists::Entity).await?;
        truncate_table(db, recipes::Entity).await?;
        Ok(())
    }

    async fn seed(db: &DatabaseConnection, base: &Path) -> Result<()> {
        #[derive(serde::Deserialize)]
        struct Quantity {
            unit: String,
            value: Option<f32>,
            text: Option<String>,
        }

        #[derive(serde::Deserialize)]
        struct Recipe {
            name: String,
            source: String,
            book_page: Option<i32>,
            book_title: Option<String>,
            website_url: Option<String>,
            ingredients: HashMap<String, Quantity>,
            tags: Option<Vec<String>>,
        }

        #[derive(serde::Deserialize)]
        struct ListItem {
            in_basket: bool,
            unit: String,
            value: Option<f32>,
            text: Option<String>,
        }

        #[derive(serde::Deserialize)]
        struct Data {
            recipes: Vec<Recipe>,
            ingredients: Vec<String>,
            shoppinglists: HashMap<String, HashMap<String, ListItem>>,
        }

        let data_yaml = File::open(base.join("data.yaml"))?;
        let data: Data = serde_yaml::from_reader(data_yaml)?;

        use sea_orm::ActiveValue as AV;
        let mut ingredients = HashMap::new();
        for ingredient_name in data.ingredients {
            let mut ingredient = ingredients::ActiveModel::new();
            ingredient.name = AV::set(ingredient_name);
            let ingredient = ingredient.insert(db).await?;
            ingredients.insert(ingredient.name.clone(), ingredient);
        }

        for recipe in data.recipes {
            let mut model = recipes::ActiveModel::new();
            model.name = AV::set(recipe.name);
            model.book_title = recipe
                .book_title
                .map_or_else(AV::not_set, |bt| AV::set(Some(bt)));
            model.book_page = recipe
                .book_page
                .map_or_else(AV::not_set, |p| AV::set(Some(p)));
            model.website_url = recipe
                .website_url
                .map_or_else(AV::not_set, |w| AV::set(Some(w)));
            model.source = AV::set(recipe.source);
            let model = model.insert(db).await.unwrap();

            for (name, quantity) in recipe.ingredients {
                let mut q = quantities::ActiveModel::new();
                q.value = quantity
                    .value
                    .map_or_else(AV::not_set, |v| AV::set(Some(v)));
                q.text = quantity.text.map_or_else(AV::not_set, |t| AV::set(Some(t)));
                q.unit = AV::set(quantity.unit);
                let quantity = q.insert(db).await.unwrap();

                let mut in_recipe = ingredients_in_recipes::ActiveModel::new();
                in_recipe.ingredients_id = AV::set(ingredients[&name].id);
                in_recipe.quantities_id = AV::set(quantity.id);
                in_recipe.recipes_id = AV::set(model.id);
                in_recipe.insert(db).await.unwrap();
            }

            for tag in recipe.tags.unwrap_or_default() {
                println!("about to create tag {tag}");

                let upsert_tag = _entities::tags::Entity::upsert(db, tag).await?;

                _entities::tags_on_recipes::ActiveModel {
                    tag_id: AV::set(upsert_tag.id),
                    recipe_id: AV::set(model.id),
                    ..Default::default()
                }
                .insert(db)
                .await?;
            }
        }

        for (name, is) in data.shoppinglists {
            let mut model = shoppinglists::ActiveModel::new();
            model.name = AV::set(name);
            let model = model.insert(db).await.unwrap();

            for (name, quantity) in is {
                let mut q = quantities::ActiveModel::new();
                q.value = quantity
                    .value
                    .map_or_else(AV::not_set, |v| AV::set(Some(v)));
                q.text = quantity.text.map_or_else(AV::not_set, |t| AV::set(Some(t)));
                q.unit = AV::set(quantity.unit);
                let q = q.insert(db).await.unwrap();

                let mut iis = ingredients_in_shoppinglists::ActiveModel::new();
                iis.in_basket = AV::set(quantity.in_basket);
                iis.quantities_id = AV::set(q.id);

                if !ingredients.contains_key(&name) {
                    panic!("{name} not an ingredient");
                }

                iis.ingredients_id = AV::set(ingredients[&name].id);
                iis.shoppinglists_id = AV::set(model.id);
                iis.insert(db).await.unwrap();
            }
        }

        db::seed::<users::ActiveModel>(db, &base.join("users.yaml").display().to_string()).await?;
        for table in ["users"] {
            db.query_one(Statement::from_string(
                DbBackend::Postgres,
                format!("SELECT setval('{table}_id_seq', (SELECT MAX(id) FROM {table}))"),
            ))
            .await?;
        }

        Ok(())
    }
}
