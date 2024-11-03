use loco_rs::schema::{float_null, integer_null, text_null};
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Id,
    Name,
}

#[derive(DeriveIden)]
enum IngredientsInRecipes {
    Table,
    Id,
    IngredientsId,
    QuantitiesId,
    RecipesId,
}

#[derive(DeriveIden)]
enum IngredientsInShoppinglists {
    Table,
    Id,
    InBasket,
    ShoppinglistsId,
    IngredientsId,
    QuantitiesId,
    RecipeId,
    Note,
}

#[derive(DeriveIden)]
enum MealPlans {
    Table,
    Id,
    Name,
}

#[derive(DeriveIden)]
enum MealsInMealPlans {
    Table,
    Id,
    MealPlanId,
    RecipeId,
    UntrackedMealName,
    Section,
    IsCooked,
}

#[derive(DeriveIden)]
enum Quantities {
    Table,
    Id,
    Unit,
    Value,
    Text,
}

#[derive(DeriveIden)]
enum Recipes {
    Table,
    Id,
    Name,
    BookTitle,
    BookPage,
    WebsiteUrl,
    Source,
    Tags,
    Rating,
    Notes,
}

#[derive(DeriveIden)]
enum Shoppinglists {
    Table,
    Id,
    Name,
}

#[derive(DeriveIden)]
enum Tags {
    Table,
    Id,
    Name,
    Order,
    IsAisle,
}

#[derive(DeriveIden)]
enum TagsOnIngredients {
    Table,
    Id,
    TagId,
    IngredientId,
}

#[derive(Iden)]
pub enum Users {
    Table,
    Id,
    Pid,
    Email,
    Name,
    Password,
    ApiKey,
    ResetToken,
    ResetSentAt,
    EmailVerificationToken,
    EmailVerificationSentAt,
    EmailVerifiedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto(Ingredients::Table)
                    .col(pk_auto(Ingredients::Id).to_owned())
                    .col(string(Ingredients::Name).to_owned().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(IngredientsInRecipes::Table)
                    .col(pk_auto(IngredientsInRecipes::Id).to_owned())
                    .col(integer(IngredientsInRecipes::RecipesId).to_owned())
                    .col(integer(IngredientsInRecipes::IngredientsId).to_owned())
                    .col(integer(IngredientsInRecipes::QuantitiesId).to_owned())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-ingredients")
                            .from(
                                IngredientsInRecipes::Table,
                                IngredientsInRecipes::IngredientsId,
                            )
                            .to(Ingredients::Table, Ingredients::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-quantities")
                            .from(
                                IngredientsInRecipes::Table,
                                IngredientsInRecipes::QuantitiesId,
                            )
                            .to(Quantities::Table, Quantities::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-recipes")
                            .from(IngredientsInRecipes::Table, IngredientsInRecipes::RecipesId)
                            .to(Recipes::Table, Recipes::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(IngredientsInShoppinglists::Table)
                    .col(pk_auto(IngredientsInShoppinglists::Id).to_owned())
                    .col(boolean(IngredientsInShoppinglists::InBasket).to_owned())
                    .col(integer(IngredientsInShoppinglists::ShoppinglistsId).to_owned())
                    .col(integer(IngredientsInShoppinglists::IngredientsId).to_owned())
                    .col(integer(IngredientsInShoppinglists::QuantitiesId).to_owned())
                    .col(integer_null(IngredientsInShoppinglists::RecipeId).to_owned())
                    .col(text_null(IngredientsInShoppinglists::Note).to_owned())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredient_in_recipes-recipe-id")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::RecipeId,
                            )
                            .to(Recipes::Table, Recipes::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-ingredients")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::IngredientsId,
                            )
                            .to(Ingredients::Table, Ingredients::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-quantities")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::QuantitiesId,
                            )
                            .to(Quantities::Table, Quantities::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-shoppinglists")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::ShoppinglistsId,
                            )
                            .to(Shoppinglists::Table, Shoppinglists::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(MealPlans::Table)
                    .col(pk_auto(MealPlans::Id).to_owned())
                    .col(text(MealPlans::Name).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(MealsInMealPlans::Table)
                    .col(pk_auto(MealsInMealPlans::Id).to_owned())
                    .col(integer(MealsInMealPlans::MealPlanId).to_owned())
                    .col(integer_null(MealsInMealPlans::RecipeId).to_owned())
                    .col(text_null(MealsInMealPlans::UntrackedMealName).to_owned())
                    .col(text_null(MealsInMealPlans::Section).to_owned())
                    .col(boolean(MealsInMealPlans::IsCooked).to_owned())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-mealplans-meals_in_mealplans")
                            .from(MealsInMealPlans::Table, MealsInMealPlans::MealPlanId)
                            .to(MealPlans::Table, MealPlans::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Quantities::Table)
                    .col(pk_auto(Quantities::Id).to_owned())
                    .col(text(Quantities::Unit).to_owned())
                    .col(float_null(Quantities::Value).to_owned())
                    .col(text_null(Quantities::Text).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Quantities::Table)
                    .col(pk_auto(Quantities::Id).to_owned())
                    .col(text(Quantities::Unit).to_owned())
                    .col(float_null(Quantities::Value).to_owned())
                    .col(text_null(Quantities::Text).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Recipes::Table)
                    .col(pk_auto(Recipes::Id).to_owned())
                    .col(text(Recipes::Name).to_owned())
                    .col(text_null(Recipes::BookTitle).to_owned())
                    .col(integer_null(Recipes::BookPage).to_owned())
                    .col(text_null(Recipes::WebsiteUrl).to_owned())
                    .col(text(Recipes::Source).to_owned())
                    .col(text(Recipes::Tags).default("[]").to_owned())
                    .col(integer(Recipes::Rating).default(0).to_owned())
                    .col(text_null(Recipes::Notes).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Shoppinglists::Table)
                    .col(pk_auto(Shoppinglists::Id).to_owned())
                    .col(text(Shoppinglists::Name).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Tags::Table)
                    .col(pk_auto(Tags::Id).to_owned())
                    .col(text(Tags::Name).to_owned())
                    .col(integer_null(Tags::Order).to_owned())
                    .col(boolean(Tags::IsAisle).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(TagsOnIngredients::Table)
                    .col(pk_auto(TagsOnIngredients::Id).to_owned())
                    .col(integer(TagsOnIngredients::TagId).to_owned())
                    .col(integer(TagsOnIngredients::IngredientId).to_owned())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-tags_on_ingredients-ingredients")
                            .from(TagsOnIngredients::Table, TagsOnIngredients::IngredientId)
                            .to(Ingredients::Table, Ingredients::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-tags_on_ingredients-tags")
                            .from(TagsOnIngredients::Table, TagsOnIngredients::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(TagsOnIngredients::Table)
                    .col(pk_auto(TagsOnIngredients::Id).to_owned())
                    .col(integer(TagsOnIngredients::TagId).to_owned())
                    .col(integer(TagsOnIngredients::IngredientId).to_owned())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Users::Table)
                    .col(pk_auto(Users::Id).to_owned())
                    .col(uuid(Users::Pid).to_owned())
                    .col(string_uniq(Users::Email).to_owned())
                    .col(string(Users::Password).to_owned())
                    .col(string(Users::ApiKey).to_owned().unique_key())
                    .col(string(Users::Name).to_owned())
                    .col(string_null(Users::ResetToken).to_owned())
                    .col(timestamp_null(Users::ResetSentAt).to_owned())
                    .col(string_null(Users::EmailVerificationToken).to_owned())
                    .col(timestamp_null(Users::EmailVerificationSentAt).to_owned())
                    .col(timestamp_null(Users::EmailVerifiedAt).to_owned())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        Ok(())
    }
}
