use super::_entities::ingredients::Model as Ingredient;
use super::_entities::quantities::Model as Quantity;
use super::_entities::recipes::{ActiveModel, Model as Recipes};
use loco_rs::model::ModelError;
use sea_orm::entity::prelude::*;
use sea_orm::{DbBackend, FromQueryResult, Statement};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

type FullRecipe = (Recipes, Vec<(Ingredient, Quantity)>, Vec<String>);

pub(crate) async fn find_all(db: &DatabaseConnection) -> Result<Vec<FullRecipe>, ModelError> {
    let s = Statement::from_string(
        DbBackend::Postgres,
        r#"
        select distinct
            "recipes"."created_at" as "r_created_at",
            "recipes"."updated_at" as "r_updated_at",
            "recipes"."id" as "r_id",
            "recipes"."name" as "r_name",
            "recipes"."book_title" as "r_book_title",
            "recipes"."book_page" as "r_book_page",
            "recipes"."website_url" as "r_website_url",
            "recipes"."source" as "r_source",
            "r1"."created_at" as "i_created_at",
            "r1"."updated_at" as "i_updated_at",
            "r1"."id" as "i_id",
            "r1"."name" as "i_name",
            "q"."id" as "q_id",
            "q"."created_at" as "q_created_at",
            "q"."updated_at" as "q_updated_at",
            "q"."unit" as "q_unit",
            "q"."value" as "q_value",
            "q"."text" as "q_text",
            "t"."name" as "t_name"
        from "recipes"
        left join
            "ingredients_in_recipes" as "r0"
            on "r0"."recipes_id" = "recipes"."id"
        left join "ingredients" as "r1" on "r0"."ingredients_id" = "r1"."id"
        left join "quantities" as "q" on "r0"."quantities_id" = "q".id
        left join "tags_on_recipes" as "t_on_r" on "t_on_r"."recipe_id" = "recipes"."id"
        left join "tags" as "t" on "t_on_r"."tag_id" = "t".id
        order by "recipes"."id" asc, "r1"."id" asc, "q"."id" asc
        "#,
    );

    let rows = &db.query_all(s).await?;

    let mut result: Vec<FullRecipe> = Vec::new();
    for row in rows {
        let recipe = Recipes::from_query_result(row, "r_")?;
        let ingredient = Ingredient::from_query_result_optional(row, "i_")?;
        let quantity = Quantity::from_query_result_optional(row, "q_")?;

        if result.is_empty() || result[result.len() - 1].0.id != recipe.id {
            result.push((recipe, Vec::new(), Vec::new()));
        };

        let Some(ingredient) = ingredient else {
            continue;
        };
        let Some(quantity) = quantity else { continue };
        let last_list_idx = result.len();
        let list = &mut result[last_list_idx - 1];
        list.1.push((ingredient, quantity));
    }
    Ok(result)
}

// TODO: actually join in on the tags!
pub(crate) async fn find_one(
    db: &DatabaseConnection,
    id: i32,
) -> Result<Option<FullRecipe>, ModelError> {
    let s = Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        select distinct
            "recipes"."created_at" as "r_created_at",
            "recipes"."updated_at" as "r_updated_at",
            "recipes"."id" as "r_id",
            "recipes"."name" as "r_name",
            "recipes"."book_title" as "r_book_title",
            "recipes"."book_page" as "r_book_page",
            "recipes"."website_url" as "r_website_url",
            "recipes"."source" as "r_source",
            "r1"."created_at" as "i_created_at",
            "r1"."updated_at" as "i_updated_at",
            "r1"."id" as "i_id",
            "r1"."name" as "i_name",
            "q"."id" as "q_id",
            "q"."created_at" as "q_created_at",
            "q"."updated_at" as "q_updated_at",
            "q"."unit" as "q_unit",
            "q"."value" as "q_value",
            "q"."text" as "q_text",
            "tr"."name" as "recipe_tag"
        from "recipes"
        left join
            "ingredients_in_recipes" as "r0"
            on "r0"."recipes_id" = "recipes"."id"
        left join "ingredients" as "r1" on "r0"."ingredients_id" = "r1"."id"
        left join "quantities" as "q" on "r0"."quantities_id" = "q".id
        left join "tags_on_ingredients" as "t_on_i" on "t_on_i"."ingredient_id" = "r1"."id"
        left join "tags_on_recipes" as "t_on_r" on "t_on_r"."recipe_id" = "recipes"."id"
        left join "tags" as "ti" on "t_on_i"."tag_id" = "ti".id
        left join "tags" as "tr" on "t_on_r"."tag_id" = "tr".id
        where "recipes"."id" = $1
        order by "recipes"."id" asc, "r1"."id" asc, "q"."id" asc
        "#,
        vec![sea_orm::Value::Int(Some(id))],
    );

    let rows = &db.query_all(s).await?;

    let mut result: Vec<FullRecipe> = Vec::new();
    for row in rows {
        let recipe = Recipes::from_query_result(row, "r_")?;
        let ingredient = Ingredient::from_query_result_optional(row, "i_")?;
        let quantity = Quantity::from_query_result_optional(row, "q_")?;

        if result.is_empty() || result[result.len() - 1].0.id != recipe.id {
            result.push((recipe, Vec::new(), Vec::new()));
        };

        let Some(ingredient) = ingredient else {
            continue;
        };
        let Some(quantity) = quantity else { continue };
        let last_list_idx = result.len();
        let list = &mut result[last_list_idx - 1];
        list.1.push((ingredient, quantity));
    }
    Ok(Some(result.remove(0)))
}
