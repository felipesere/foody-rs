#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;

mod m20220101_000001_users;
mod m20231103_114510_notes;

mod m20231225_211837_ingredients;
mod m20231225_212415_shoppinglists;
mod m20231225_213137_quantities;
mod m20231225_213554_ingredients_in_shoppinglists;
mod m20240103_132826_recipes;
mod m20240103_144013_ingredients_in_recipes;
mod m20240104_160607_change_source_to_just_text;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20231103_114510_notes::Migration),
            Box::new(m20231225_211837_ingredients::Migration),
            Box::new(m20231225_212415_shoppinglists::Migration),
            Box::new(m20231225_213137_quantities::Migration),
            Box::new(m20231225_213554_ingredients_in_shoppinglists::Migration),
            Box::new(m20240103_132826_recipes::Migration),
            Box::new(m20240103_144013_ingredients_in_recipes::Migration),
            Box::new(m20240104_160607_change_source_to_just_text::Migration),
        ]
    }
}