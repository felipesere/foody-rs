use std::collections::BTreeSet;

use super::_entities::ingredients::Model as Ingredient;
use super::_entities::quantities::Model as Quantity;
use super::_entities::recipes::{ActiveModel, Model as Recipes};
use super::_entities::{self};
use loco_rs::model::ModelError;
use sea_orm::entity::prelude::*;
use sea_orm::{DbBackend, FromQueryResult, Statement};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

/// The connection between `recipes` and `tags`
struct RecipeToTags;

impl Linked for RecipeToTags {
    type FromEntity = _entities::recipes::Entity;
    type ToEntity = _entities::tags::Entity;

    fn link(&self) -> Vec<sea_orm::LinkDef> {
        vec![
            super::_entities::tags_on_recipes::Relation::Recipes
                .def()
                .rev(),
            super::_entities::tags_on_recipes::Relation::Tags.def(),
        ]
    }
}

// TODO: Turn this into an actual struct with proper names
type FullRecipe = (Recipes, Vec<(Ingredient, Quantity)>, BTreeSet<String>);

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
        let tag: Option<String> = row.try_get("t_", "name")?;

        if result.is_empty() || result[result.len() - 1].0.id != recipe.id {
            result.push((recipe, Vec::new(), BTreeSet::new()));
        };

        let Some(ingredient) = ingredient else {
            continue;
        };
        let Some(quantity) = quantity else { continue };
        let last_list_idx = result.len();
        let list = &mut result[last_list_idx - 1];

        if let Some(t) = tag {
            list.2.insert(t);
        }

        list.1.push((ingredient, quantity));
    }
    Ok(result)
}

// TODO: actually join in on the tags!
pub(crate) async fn find_one(
    db: &DatabaseConnection,
    id: i32,
) -> Result<Option<FullRecipe>, ModelError> {
    let recipe = _entities::recipes::Entity::find_by_id(id)
        .one(db)
        .await?
        .ok_or_else(|| loco_rs::model::ModelError::EntityNotFound)?;

    let tags = recipe.find_linked(RecipeToTags).all(db).await?;

    let backend = db.get_database_backend();

    let ingredients_with_quantities = Statement::from_sql_and_values(
        backend,
        r#"
                SELECT
                       "i"."created_at" AS "I_created_at",
                       "i"."updated_at" AS "I_updated_at",
                       "i"."id"         AS "I_id",
                       "i"."name"       AS "I_name",
                       "q"."created_at" AS "Q_created_at",
                       "q"."updated_at" AS "Q_updated_at",
                       "q"."id"         AS "Q_id",
                       "q"."unit"       AS "Q_unit",
                       "q"."value"      AS "Q_value",
                       "q"."text"       AS "Q_text"
                    FROM "ingredients_in_recipes"
                        JOIN "ingredients" i on i.id = ingredients_in_recipes.ingredients_id
                        JOIN "quantities"  q on q.id = ingredients_in_recipes.quantities_id
                WHERE "ingredients_in_recipes"."recipes_id" = $1
        "#,
        vec![id.into()],
    );
    let rows = &db.query_all(ingredients_with_quantities).await?;
    let mut ingredients: Vec<(Ingredient, Quantity)> = Vec::new();

    for row in rows {
        let ingredient = Ingredient::from_query_result(row, "I_")?;
        let quantity = Quantity::from_query_result(row, "Q_")?;
        ingredients.push((ingredient, quantity));
    }

    Ok(Some((
        recipe,
        ingredients,
        tags.into_iter().map(|t| t.name).collect(),
    )))
}
