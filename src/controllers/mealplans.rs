use axum::{
    extract::{self, State},
    routing::get,
};
use loco_rs::{controller::middleware, prelude::*};
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{
        ingredients_in_recipes, ingredients_in_shoppinglists, meal_plans, meals_in_meal_plans,
    },
    users,
};

#[derive(Serialize, Deserialize, Debug)]
struct Recipe {
    id: i32,
}

#[derive(Serialize, Deserialize, Debug)]
struct UntrackedMeal {
    name: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Meal {
    id: i32,
    details: MealDetails,
    section: Option<String>,
    is_cooked: bool,
    created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case", tag = "type")]
enum MealDetails {
    FromRecipe(Recipe),
    Untracked(UntrackedMeal),
}

#[derive(Serialize, Deserialize, Debug)]
struct MealPlanResponse {
    id: i32,
    created_at: String,
    name: String,
    meals: Vec<Meal>,
}

#[derive(Serialize, Deserialize, Debug)]
struct MealPlansResponse {
    meal_plans: Vec<MealPlanResponse>,
}

impl From<(meal_plans::Model, Vec<meals_in_meal_plans::Model>)> for MealPlanResponse {
    fn from(value: (meal_plans::Model, Vec<meals_in_meal_plans::Model>)) -> Self {
        let (mealplan, meals) = value;
        Self {
            id: mealplan.id,
            created_at: mealplan.created_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
            name: mealplan.name,
            meals: meals
                .into_iter()
                .map(|m| {
                    let details = if let Some(recipe_id) = m.recipe_id {
                        MealDetails::FromRecipe(Recipe { id: recipe_id })
                    } else {
                        MealDetails::Untracked(UntrackedMeal {
                            name: m
                                .untracked_meal_name
                                .expect("meal was had no recipe_id and was meant to be untracked"),
                        })
                    };

                    Meal {
                        id: m.id,
                        details,
                        section: m.section,
                        is_cooked: m.is_cooked,
                        created_at: m.created_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
                    }
                })
                .collect(),
        }
    }
}

impl<T> From<Vec<T>> for MealPlansResponse
where
    T: Into<MealPlanResponse>,
{
    fn from(value: Vec<T>) -> Self {
        Self {
            meal_plans: value.into_iter().map(|m| m.into()).collect(),
        }
    }
}

pub async fn all_mealplans(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let plans = meal_plans::Entity::find()
        .find_with_related(meals_in_meal_plans::Entity)
        .all(&ctx.db)
        .await?;

    format::json(MealPlansResponse::from(plans))
}

#[derive(Deserialize)]
pub struct NewMealPlan {
    name: String,
    keep_uncooked: bool,
}

pub async fn create_meal_plan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<NewMealPlan>,
) -> Result<Response> {
    use sea_orm::{QueryOrder, QuerySelect};

    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let id = if params.keep_uncooked {
        let previous_plan_id: Option<i32> = meal_plans::Entity::find()
            .select_only()
            .column(meal_plans::Column::Id)
            .order_by_desc(meal_plans::Column::CreatedAt)
            .into_tuple()
            .one(&ctx.db)
            .await?;

        previous_plan_id
    } else {
        None
    };

    let plan = meal_plans::ActiveModel {
        name: ActiveValue::Set(params.name),
        ..Default::default()
    };
    let plan = plan.insert(&ctx.db).await?;

    let meals = if let Some(id) = id {
        // Can be done faster on the DB side with a UDPATE + sub-SELECT
        let meals: Vec<_> = meals_in_meal_plans::Entity::find()
            .filter(meals_in_meal_plans::Column::MealPlanId.eq(id))
            .filter(meals_in_meal_plans::Column::IsCooked.eq(false))
            .all(&ctx.db)
            .await?
            .into_iter()
            .map(|meal| meals_in_meal_plans::ActiveModel {
                meal_plan_id: ActiveValue::Set(plan.id),
                recipe_id: ActiveValue::Set(meal.recipe_id),
                untracked_meal_name: ActiveValue::Set(meal.untracked_meal_name),
                section: ActiveValue::Set(meal.section),
                is_cooked: ActiveValue::Set(false),
                ..Default::default()
            })
            .collect();

        meals_in_meal_plans::Entity::insert_many(meals.clone())
            .exec(&ctx.db)
            .await?;

        meals_in_meal_plans::Entity::find()
            .filter(meals_in_meal_plans::Column::MealPlanId.eq(plan.id))
            .all(&ctx.db)
            .await?
    } else {
        Vec::new()
    };

    format::json(MealPlanResponse::from((plan, meals)))
}

#[derive(Deserialize)]
pub struct AddMealParams {
    details: MealDetails,
    section: Option<String>,
}

pub async fn add_to_meal(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(meal): extract::Json<AddMealParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut meal_to_be_added = meals_in_meal_plans::ActiveModel {
        meal_plan_id: ActiveValue::Set(id),
        is_cooked: ActiveValue::Set(false),
        section: ActiveValue::Set(meal.section),
        ..Default::default()
    };

    match meal.details {
        MealDetails::FromRecipe(recipe) => {
            // TODO: Check if the recipe exists?
            meal_to_be_added.recipe_id = ActiveValue::Set(Some(recipe.id));
            meal_to_be_added.untracked_meal_name = ActiveValue::Set(None);
        }
        MealDetails::Untracked(n) => {
            meal_to_be_added.recipe_id = ActiveValue::Set(None);
            meal_to_be_added.untracked_meal_name = ActiveValue::Set(Some(n.name));
        }
    };

    meal_to_be_added.save(&ctx.db).await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct MarkMealAsCookedParams {
    is_cooked: bool,
}

pub async fn mark_meal_as_cooked(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, meal_id)): Path<(i32, i32)>,
    extract::Json(mark): extract::Json<MarkMealAsCookedParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let meal = meals_in_meal_plans::Entity::find_by_id(meal_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut meal = meal.into_active_model();
    meal.is_cooked = ActiveValue::Set(mark.is_cooked);
    meal.save(&ctx.db).await?;

    Ok(())
}

pub async fn delete_meal_from_mealplan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, meal_id)): Path<(i32, i32)>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    meals_in_meal_plans::Entity::delete_by_id(meal_id)
        .exec(&ctx.db)
        .await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct SetMealOfSectionParams {
    section: String,
}

pub async fn set_section_of_meal(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, meal_id)): Path<(i32, i32)>,
    extract::Json(SetMealOfSectionParams { section }): extract::Json<SetMealOfSectionParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let meal = meals_in_meal_plans::Entity::find_by_id(meal_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut meal = meal.into_active_model();
    meal.section = ActiveValue::Set(Some(section));
    meal.save(&ctx.db).await?;

    Ok(())
}

// TODO this is more of an interim thing anyway...
pub async fn clear_meal_plan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    meals_in_meal_plans::Entity::delete_many()
        .filter(meals_in_meal_plans::Column::MealPlanId.eq(id))
        .exec(&ctx.db)
        .await?;

    Ok(())
}

// TODO this is more of an interim thing anyway...
pub async fn remove_meal_plan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    // should do a tx here

    meals_in_meal_plans::Entity::delete_many()
        .filter(meals_in_meal_plans::Column::MealPlanId.eq(id))
        .exec(&ctx.db)
        .await?;

    meal_plans::Entity::delete_by_id(id).exec(&ctx.db).await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct AddMealPlanToShoppinglistsParams {
    shoppinglist: i32,
}

pub async fn add_meal_plan_to_shoppinglist(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(AddMealPlanToShoppinglistsParams {
        shoppinglist: shoppdinglist,
    }): extract::Json<AddMealPlanToShoppinglistsParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let recipes_in_shoppinglist: Vec<_> = ingredients_in_shoppinglists::Entity::find()
        .filter(ingredients_in_shoppinglists::Column::ShoppinglistsId.eq(shoppdinglist))
        .filter(ingredients_in_shoppinglists::Column::RecipeId.is_not_null())
        .all(&ctx.db)
        .await?
        .into_iter()
        // NOT NULL condition is part of query
        .map(|item| item.recipe_id.unwrap())
        .collect();

    tracing::error!("The current recipes in the shoppinglist are: {recipes_in_shoppinglist:?}");

    let uncooked_recipes = meals_in_meal_plans::Entity::find()
        .filter(
            meals_in_meal_plans::Column::MealPlanId
                .eq(id)
                .and(meals_in_meal_plans::Column::IsCooked.eq(false))
                .and(meals_in_meal_plans::Column::RecipeId.is_not_null()),
        )
        .all(&ctx.db)
        .await?;

    tracing::error!("The uncooked recipes are: {uncooked_recipes:?}");

    let missing_recipes = uncooked_recipes
        .into_iter()
        .filter_map(|ur| ur.recipe_id)
        // Remove all recipes where at least some ingredient is already on the list
        .filter(|uc| !recipes_in_shoppinglist.contains(uc))
        .collect::<Vec<_>>();

    tracing::error!("The ones we should add: {missing_recipes:?}");

    let ingredients = ingredients_in_recipes::Entity::find()
        .filter(ingredients_in_recipes::Column::RecipesId.is_in(missing_recipes))
        .all(&ctx.db)
        .await?;

    tracing::error!("Their ingredients: {ingredients:?}");

    let to_be_added: Vec<_> = ingredients
        .into_iter()
        .map(|i| ingredients_in_shoppinglists::ActiveModel {
            in_basket: ActiveValue::set(false),
            shoppinglists_id: ActiveValue::set(shoppdinglist),
            ingredients_id: ActiveValue::set(i.ingredients_id),
            quantities_id: ActiveValue::set(i.quantities_id),
            recipe_id: ActiveValue::set(Some(i.recipes_id)),
            ..Default::default()
        })
        .collect();

    if !to_be_added.is_empty() {
        ingredients_in_shoppinglists::Entity::insert_many(to_be_added)
            .exec(&ctx.db)
            .await?;
    }

    Ok(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/mealplans")
        .add("/", get(all_mealplans))
        .add("/", post(create_meal_plan))
        .add("/{id}", delete(remove_meal_plan))
        .add("/{id}/shoppinglist", post(add_meal_plan_to_shoppinglist))
        .add("/{id}/clear", post(clear_meal_plan))
        .add("/{id}/meal", post(add_to_meal))
        .add("/{id}/meal/{meal_id}", delete(delete_meal_from_mealplan))
        .add("/{id}/meal/{meal_id}/cooked", post(mark_meal_as_cooked))
        .add("/{id}/meal/{meal_id}/section", post(set_section_of_meal))
}

#[cfg(test)]
mod tests {
    use insta::assert_json_snapshot;

    use crate::controllers::mealplans::MealDetails;

    use super::{Meal, MealPlanResponse, MealPlansResponse, Recipe, UntrackedMeal};

    #[test]
    fn produces_the_right_shape_of_json() {
        let created_at = "2024-01-22 17:34:01";
        let meal_plans = MealPlansResponse {
            meal_plans: vec![
                MealPlanResponse {
                    id: 1,
                    created_at: created_at.to_string(),
                    name: "the first".to_string(),
                    meals: vec![
                        Meal {
                            id: 90,
                            details: MealDetails::FromRecipe(Recipe { id: 10 }),
                            section: None,
                            is_cooked: true,
                            created_at: created_at.to_string(),
                        },
                        Meal {
                            id: 91,
                            details: MealDetails::Untracked(UntrackedMeal {
                                name: "FrozenBanana".to_string(),
                            }),
                            section: None,
                            is_cooked: false,
                            created_at: created_at.to_string(),
                        },
                    ],
                },
                MealPlanResponse {
                    id: 2,
                    created_at: created_at.to_string(),
                    name: "the second".to_string(),
                    meals: vec![Meal {
                        id: 91,
                        details: MealDetails::FromRecipe(Recipe { id: 11 }),
                        section: None,
                        is_cooked: false,
                        created_at: created_at.to_string(),
                    }],
                },
            ],
        };

        assert_json_snapshot!(&meal_plans);
    }
}
