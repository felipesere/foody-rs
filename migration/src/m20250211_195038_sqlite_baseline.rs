use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

// Table definitions
#[derive(DeriveIden)]
enum Aisles {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Name,
    Order,
}

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Name,
    Tags,
    Aisle,
}

#[derive(DeriveIden)]
enum MealPlans {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Name,
}

#[derive(DeriveIden)]
enum Quantities {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Unit,
    Value,
    Text,
}

#[derive(DeriveIden)]
enum Recipes {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Name,
    BookTitle,
    BookPage,
    WebsiteUrl,
    Source,
    Tags,
    Rating,
    Notes,
    Duration,
}

#[derive(DeriveIden)]
enum MealsInMealPlans {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    MealPlanId,
    RecipeId,
    UntrackedMealName,
    Section,
    IsCooked,
}

// New tables
#[derive(DeriveIden)]
enum IngredientsInRecipes {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    RecipesId,
    IngredientsId,
    QuantitiesId,
}

#[derive(DeriveIden)]
enum Shoppinglists {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Name,
}

#[derive(DeriveIden)]
enum IngredientsInShoppinglists {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    InBasket,
    ShoppinglistsId,
    IngredientsId,
    QuantitiesId,
    RecipeId,
    Note,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    CreatedAt,
    UpdatedAt,
    Pid,
    Email,
    Password,
    ApiKey,
    Name,
    ResetToken,
    ResetSentAt,
    EmailVerificationToken,
    EmailVerificationSentAt,
    EmailVerifiedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create aisles table
        manager
            .create_table(
                Table::create()
                    .table(Aisles::Table)
                    .col(
                        ColumnDef::new(Aisles::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Aisles::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Aisles::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Aisles::Name).string().not_null())
                    .col(ColumnDef::new(Aisles::Order).integer().not_null())
                    .to_owned(),
            )
            .await?;

        // Create ingredients table
        manager
            .create_table(
                Table::create()
                    .table(Ingredients::Table)
                    .col(
                        ColumnDef::new(Ingredients::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Ingredients::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Ingredients::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Ingredients::Name)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Ingredients::Tags)
                            .text()
                            .not_null()
                            .default(Expr::value("[]")),
                    )
                    .col(ColumnDef::new(Ingredients::Aisle).integer())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients-aisle")
                            .from(Ingredients::Table, Ingredients::Aisle)
                            .to(Aisles::Table, Aisles::Id),
                    )
                    .to_owned(),
            )
            .await?;

        // Create meal_plans table
        manager
            .create_table(
                Table::create()
                    .table(MealPlans::Table)
                    .col(
                        ColumnDef::new(MealPlans::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(MealPlans::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(MealPlans::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(MealPlans::Name).string().not_null())
                    .to_owned(),
            )
            .await?;

        // Create quantities table
        manager
            .create_table(
                Table::create()
                    .table(Quantities::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Quantities::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Quantities::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Quantities::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Quantities::Unit).string().not_null())
                    .col(ColumnDef::new(Quantities::Value).float())
                    .col(ColumnDef::new(Quantities::Text).string())
                    .to_owned(),
            )
            .await?;

        // Create recipes table
        manager
            .create_table(
                Table::create()
                    .table(Recipes::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Recipes::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Recipes::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Recipes::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Recipes::Name).string().not_null())
                    .col(ColumnDef::new(Recipes::BookTitle).string())
                    .col(ColumnDef::new(Recipes::BookPage).integer())
                    .col(ColumnDef::new(Recipes::WebsiteUrl).string())
                    .col(ColumnDef::new(Recipes::Source).string().not_null())
                    .col(
                        ColumnDef::new(Recipes::Tags)
                            .text()
                            .not_null()
                            .default(Expr::value("[]")),
                    )
                    .col(
                        ColumnDef::new(Recipes::Rating)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(ColumnDef::new(Recipes::Notes).text().not_null().default(""))
                    .col(ColumnDef::new(Recipes::Duration).string())
                    .to_owned(),
            )
            .await?;

        // Create meals_in_meal_plans table
        manager
            .create_table(
                Table::create()
                    .table(MealsInMealPlans::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(MealsInMealPlans::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(MealsInMealPlans::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(MealsInMealPlans::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(MealsInMealPlans::MealPlanId)
                            .integer()
                            .not_null(),
                    )
                    .col(ColumnDef::new(MealsInMealPlans::RecipeId).integer())
                    .col(ColumnDef::new(MealsInMealPlans::UntrackedMealName).string())
                    .col(ColumnDef::new(MealsInMealPlans::Section).string())
                    .col(
                        ColumnDef::new(MealsInMealPlans::IsCooked)
                            .boolean()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-mealplans-meals_in_mealplans")
                            .from(MealsInMealPlans::Table, MealsInMealPlans::MealPlanId)
                            .to(MealPlans::Table, MealPlans::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-mealplans-recipes")
                            .from(MealsInMealPlans::Table, MealsInMealPlans::RecipeId)
                            .to(Recipes::Table, Recipes::Id),
                    )
                    .to_owned(),
            )
            .await?;

        // Create ingredients_in_recipes table
        manager
            .create_table(
                Table::create()
                    .table(IngredientsInRecipes::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(IngredientsInRecipes::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInRecipes::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(IngredientsInRecipes::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(IngredientsInRecipes::RecipesId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInRecipes::IngredientsId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInRecipes::QuantitiesId)
                            .integer()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-recipes")
                            .from(IngredientsInRecipes::Table, IngredientsInRecipes::RecipesId)
                            .to(Recipes::Table, Recipes::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-ingredients")
                            .from(
                                IngredientsInRecipes::Table,
                                IngredientsInRecipes::IngredientsId,
                            )
                            .to(Ingredients::Table, Ingredients::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-quantities")
                            .from(
                                IngredientsInRecipes::Table,
                                IngredientsInRecipes::QuantitiesId,
                            )
                            .to(Quantities::Table, Quantities::Id),
                    )
                    .to_owned(),
            )
            .await?;

        // Create shoppinglists table
        manager
            .create_table(
                Table::create()
                    .table(Shoppinglists::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Shoppinglists::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Shoppinglists::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Shoppinglists::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Shoppinglists::Name).string().not_null())
                    .to_owned(),
            )
            .await?;

        // Create ingredients_in_shoppinglists table
        manager
            .create_table(
                Table::create()
                    .table(IngredientsInShoppinglists::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::InBasket)
                            .boolean()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::ShoppinglistsId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::IngredientsId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(IngredientsInShoppinglists::QuantitiesId)
                            .integer()
                            .not_null(),
                    )
                    .col(ColumnDef::new(IngredientsInShoppinglists::RecipeId).integer())
                    .col(ColumnDef::new(IngredientsInShoppinglists::Note).string())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-shoppinglists")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::ShoppinglistsId,
                            )
                            .to(Shoppinglists::Table, Shoppinglists::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-ingredients")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::IngredientsId,
                            )
                            .to(Ingredients::Table, Ingredients::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-quantities")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::QuantitiesId,
                            )
                            .to(Quantities::Table, Quantities::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredient_in_recipes-recipe-id")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::RecipeId,
                            )
                            .to(Recipes::Table, Recipes::Id),
                    )
                    .to_owned(),
            )
            .await?;

        // Create users table
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Users::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Users::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Users::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Users::Pid).uuid().not_null())
                    .col(
                        ColumnDef::new(Users::Email)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(ColumnDef::new(Users::Password).string().not_null())
                    .col(
                        ColumnDef::new(Users::ApiKey)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(ColumnDef::new(Users::Name).string().not_null())
                    .col(ColumnDef::new(Users::ResetToken).string())
                    .col(ColumnDef::new(Users::ResetSentAt).timestamp())
                    .col(ColumnDef::new(Users::EmailVerificationToken).string())
                    .col(ColumnDef::new(Users::EmailVerificationSentAt).timestamp())
                    .col(ColumnDef::new(Users::EmailVerifiedAt).timestamp())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order of creation
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(IngredientsInShoppinglists::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(Table::drop().table(Shoppinglists::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(IngredientsInRecipes::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(MealsInMealPlans::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Recipes::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Quantities::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(MealPlans::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Ingredients::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Aisles::Table).to_owned())
            .await?;

        Ok(())
    }
}
