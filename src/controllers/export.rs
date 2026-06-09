use std::collections::HashMap;

use axum::{extract::State, routing::get};
use loco_rs::prelude::*;
use sea_orm::QueryOrder;
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{
        aisles, ingredients, ingredients_in_recipes, ingredients_in_shoppinglists, meal_plans,
        meals_in_meal_plans, quantities, recipes, shoppinglists, storages,
    },
    users,
};

#[derive(Serialize, Deserialize, Debug)]
struct Export {
    version: u32,
    aisles: Vec<AisleExport>,
    storages: Vec<StorageExport>,
    ingredients: Vec<IngredientExport>,
    recipes: Vec<RecipeExport>,
    meal_plans: Vec<MealPlanExport>,
    shoppinglists: Vec<ShoppinglistExport>,
}

#[derive(Serialize, Deserialize, Debug)]
struct AisleExport {
    name: String,
    order: i16,
}

#[derive(Serialize, Deserialize, Debug)]
struct StorageExport {
    name: String,
    order: i16,
}

#[derive(Serialize, Deserialize, Debug)]
struct IngredientExport {
    name: String,
    tags: Vec<String>,
    aisle: Option<String>,
    stored_in: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct QuantityExport {
    unit: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    value: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    text: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct RecipeIngredientExport {
    name: String,
    quantity: QuantityExport,
}

#[derive(Serialize, Deserialize, Debug)]
struct RecipeExport {
    name: String,
    source: String,
    book_title: Option<String>,
    book_page: Option<i32>,
    website_url: Option<String>,
    tags: Vec<String>,
    rating: i32,
    notes: String,
    duration: Option<String>,
    ingredients: Vec<RecipeIngredientExport>,
}

#[derive(Serialize, Deserialize, Debug)]
struct MealExport {
    #[serde(skip_serializing_if = "Option::is_none")]
    recipe: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    untracked_meal_name: Option<String>,
    section: Option<String>,
    is_cooked: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct MealPlanExport {
    name: String,
    meals: Vec<MealExport>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ShoppinglistItemExport {
    ingredient: String,
    quantity: QuantityExport,
    in_basket: bool,
    from_recipe: Option<String>,
    note: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ShoppinglistExport {
    name: String,
    items: Vec<ShoppinglistItemExport>,
}

pub async fn export(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let db = &ctx.db;

    let aisle_rows = aisles::Entity::find()
        .order_by_asc(aisles::Column::Order)
        .all(db)
        .await?;
    let aisle_name_by_id: HashMap<i32, String> =
        aisle_rows.iter().map(|a| (a.id, a.name.clone())).collect();
    let aisles_out: Vec<AisleExport> = aisle_rows
        .into_iter()
        .map(|a| AisleExport {
            name: a.name,
            order: a.order,
        })
        .collect();

    let storage_rows = storages::Entity::find()
        .order_by_asc(storages::Column::Order)
        .all(db)
        .await?;
    let storage_name_by_id: HashMap<i32, String> =
        storage_rows.iter().map(|s| (s.id, s.name.clone())).collect();
    let storages_out: Vec<StorageExport> = storage_rows
        .into_iter()
        .map(|s| StorageExport {
            name: s.name,
            order: s.order,
        })
        .collect();

    let ingredient_rows = ingredients::Entity::find()
        .order_by_asc(ingredients::Column::Name)
        .all(db)
        .await?;
    let ingredient_name_by_id: HashMap<i32, String> = ingredient_rows
        .iter()
        .map(|i| (i.id, i.name.clone()))
        .collect();
    let ingredients_out: Vec<IngredientExport> = ingredient_rows
        .into_iter()
        .map(|i| IngredientExport {
            name: i.name,
            tags: i.tags,
            aisle: i.aisle.and_then(|id| aisle_name_by_id.get(&id).cloned()),
            stored_in: i
                .stored_in
                .and_then(|id| storage_name_by_id.get(&(id as i32)).cloned()),
        })
        .collect();

    let quantity_rows = quantities::Entity::find().all(db).await?;
    let quantity_by_id: HashMap<i32, QuantityExport> = quantity_rows
        .into_iter()
        .map(|q| {
            (
                q.id,
                QuantityExport {
                    unit: q.unit,
                    value: q.value,
                    text: q.text,
                },
            )
        })
        .collect();

    let recipe_rows = recipes::Entity::find()
        .order_by_asc(recipes::Column::Name)
        .all(db)
        .await?;
    let recipe_name_by_id: HashMap<i32, String> =
        recipe_rows.iter().map(|r| (r.id, r.name.clone())).collect();

    let ingredients_in_recipes_rows = ingredients_in_recipes::Entity::find().all(db).await?;
    let mut recipe_ingredients_by_recipe: HashMap<i32, Vec<RecipeIngredientExport>> =
        HashMap::new();
    for row in ingredients_in_recipes_rows {
        let Some(name) = ingredient_name_by_id.get(&row.ingredients_id).cloned() else {
            continue;
        };
        let Some(quantity) = quantity_by_id.get(&row.quantities_id).cloned() else {
            continue;
        };
        recipe_ingredients_by_recipe
            .entry(row.recipes_id)
            .or_default()
            .push(RecipeIngredientExport { name, quantity });
    }
    for items in recipe_ingredients_by_recipe.values_mut() {
        items.sort_by(|a, b| a.name.cmp(&b.name));
    }

    let recipes_out: Vec<RecipeExport> = recipe_rows
        .into_iter()
        .map(|r| {
            let ingredients = recipe_ingredients_by_recipe.remove(&r.id).unwrap_or_default();
            RecipeExport {
                name: r.name,
                source: r.source,
                book_title: r.book_title,
                book_page: r.book_page,
                website_url: r.website_url,
                tags: r.tags,
                rating: r.rating,
                notes: r.notes,
                duration: r.duration,
                ingredients,
            }
        })
        .collect();

    let meal_plan_rows = meal_plans::Entity::find()
        .order_by_asc(meal_plans::Column::Name)
        .all(db)
        .await?;
    let meals_rows = meals_in_meal_plans::Entity::find()
        .order_by_asc(meals_in_meal_plans::Column::Id)
        .all(db)
        .await?;
    let mut meals_by_plan: HashMap<i32, Vec<MealExport>> = HashMap::new();
    for m in meals_rows {
        let recipe = m
            .recipe_id
            .and_then(|id| recipe_name_by_id.get(&id).cloned());
        meals_by_plan
            .entry(m.meal_plan_id)
            .or_default()
            .push(MealExport {
                recipe,
                untracked_meal_name: m.untracked_meal_name,
                section: m.section,
                is_cooked: m.is_cooked,
            });
    }
    let meal_plans_out: Vec<MealPlanExport> = meal_plan_rows
        .into_iter()
        .map(|mp| MealPlanExport {
            meals: meals_by_plan.remove(&mp.id).unwrap_or_default(),
            name: mp.name,
        })
        .collect();

    let shoppinglist_rows = shoppinglists::Entity::find()
        .order_by_asc(shoppinglists::Column::Name)
        .all(db)
        .await?;
    let iis_rows = ingredients_in_shoppinglists::Entity::find()
        .order_by_asc(ingredients_in_shoppinglists::Column::Id)
        .all(db)
        .await?;
    let mut items_by_list: HashMap<i32, Vec<ShoppinglistItemExport>> = HashMap::new();
    for row in iis_rows {
        let Some(name) = ingredient_name_by_id.get(&row.ingredients_id).cloned() else {
            continue;
        };
        let Some(quantity) = quantity_by_id.get(&row.quantities_id).cloned() else {
            continue;
        };
        let from_recipe = row
            .recipe_id
            .and_then(|id| recipe_name_by_id.get(&id).cloned());
        items_by_list
            .entry(row.shoppinglists_id)
            .or_default()
            .push(ShoppinglistItemExport {
                ingredient: name,
                quantity,
                in_basket: row.in_basket,
                from_recipe,
                note: row.note,
            });
    }
    let shoppinglists_out: Vec<ShoppinglistExport> = shoppinglist_rows
        .into_iter()
        .map(|sl| ShoppinglistExport {
            items: items_by_list.remove(&sl.id).unwrap_or_default(),
            name: sl.name,
        })
        .collect();

    format::json(Export {
        version: 1,
        aisles: aisles_out,
        storages: storages_out,
        ingredients: ingredients_out,
        recipes: recipes_out,
        meal_plans: meal_plans_out,
        shoppinglists: shoppinglists_out,
    })
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/export").add("/", get(export))
}
