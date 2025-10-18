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
mod m20240107_090816_change_quanitty_value_to_float;
mod m20240107_210844_make_ingredient_name_unique;
mod m20240321_201052_alert_ingredients_in_shoppinglist_track_recipes;
mod m20240413_203033_remove_notes;
mod m20240527_152107_add_tags_to_ingredients;
mod m20240527_170641_tags_are_arrays;
mod m20240606_074154_tags;
mod m20240606_104740_tags_on_ingredients;
mod m20240606_104940_tags_order_nullable;
mod m20240606_110159_move_current_tags_to_new_table;
mod m20240606_183314_drop_tags_column_from_ingredients;
mod m20240610_182331_add_notes_to_ingredients_on_list;
mod m20240716_111758_tags_on_recipes;
mod m20240724_123313_rename_fk_on_tags_on_recipes;
mod m20240920_070157_create_mealplan_table;
mod m20241002_201921_recipe_holds_tags;
mod m20241104_205226_add_times_to_recipes;
mod m20241203_214722_remove_tags_on_recipes_tables;
mod m20250115_211611_add_tags_directly_to_ingredients;
mod m20250118_212554_aisles;
mod m20250118_213814_add_aisle_ref_to_ingredients;
mod m20250119_144448_copy_tags_data_to_new_columns_and_table;
mod m20250119_152408_remove_tags_table;
mod m20251018_134742_storages;
mod m20251018_204736_add_storage_ref_to_ingredients;
mod m20251018_215237_add_storage_locations;
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
            Box::new(m20240107_090816_change_quanitty_value_to_float::Migration),
            Box::new(m20240107_210844_make_ingredient_name_unique::Migration),
            Box::new(m20240321_201052_alert_ingredients_in_shoppinglist_track_recipes::Migration),
            Box::new(m20240413_203033_remove_notes::Migration),
            Box::new(m20240527_152107_add_tags_to_ingredients::Migration),
            Box::new(m20240527_170641_tags_are_arrays::Migration),
            Box::new(m20240606_074154_tags::Migration),
            Box::new(m20240606_104740_tags_on_ingredients::Migration),
            Box::new(m20240606_104940_tags_order_nullable::Migration),
            Box::new(m20240606_110159_move_current_tags_to_new_table::Migration),
            Box::new(m20240606_183314_drop_tags_column_from_ingredients::Migration),
            Box::new(m20240610_182331_add_notes_to_ingredients_on_list::Migration),
            Box::new(m20240716_111758_tags_on_recipes::Migration),
            Box::new(m20240724_123313_rename_fk_on_tags_on_recipes::Migration),
            Box::new(m20240920_070157_create_mealplan_table::Migration),
            Box::new(m20241002_201921_recipe_holds_tags::Migration),
            Box::new(m20241104_205226_add_times_to_recipes::Migration),
            Box::new(m20241203_214722_remove_tags_on_recipes_tables::Migration),
            Box::new(m20250115_211611_add_tags_directly_to_ingredients::Migration),
            Box::new(m20250118_212554_aisles::Migration),
            Box::new(m20250118_213814_add_aisle_ref_to_ingredients::Migration),
            Box::new(m20250119_144448_copy_tags_data_to_new_columns_and_table::Migration),
            Box::new(m20250119_152408_remove_tags_table::Migration),
            Box::new(m20251018_134742_storages::Migration),
            Box::new(m20251018_204736_add_storage_ref_to_ingredients::Migration),
            Box::new(m20251018_215237_add_storage_locations::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}