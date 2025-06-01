
create table aisles
(
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    id         serial
        primary key,
    name       varchar                                            not null,
    "order"    smallint                                           not null
);

alter table aisles
    owner to loco;

create table ingredients
(
    created_at timestamp      default CURRENT_TIMESTAMP                                         not null,
    updated_at timestamp      default CURRENT_TIMESTAMP                                         not null,
    id         serial
        primary key,
    name       varchar                                                                          not null
        unique,
    tags       varchar(128)[] default (ARRAY []::character varying[])::character varying(128)[] not null,
    aisle      integer
        constraint "fk-ingredients-aisle"
            references aisles
);

alter table ingredients
    owner to loco;

create table meal_plans
(
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null,
    id         serial
        primary key,
    name       varchar                             not null
);

alter table meal_plans
    owner to loco;

create table meals_in_meal_plans
(
    created_at          timestamp default CURRENT_TIMESTAMP not null,
    updated_at          timestamp default CURRENT_TIMESTAMP not null,
    id                  serial
        primary key,
    meal_plan_id        integer                             not null
        constraint "fk-mealplans-meals_in_mealplans"
            references meal_plans
            on update cascade on delete cascade,
    recipe_id           integer,
    untracked_meal_name varchar,
    section             varchar,
    is_cooked           boolean                             not null
);

alter table meals_in_meal_plans
    owner to loco;

create table quantities
(
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null,
    id         serial
        primary key,
    unit       varchar                             not null,
    value      real,
    text       varchar
);

alter table quantities
    owner to loco;

create table recipes
(
    created_at  timestamp      default CURRENT_TIMESTAMP                                         not null,
    updated_at  timestamp      default CURRENT_TIMESTAMP                                         not null,
    id          serial
        primary key,
    name        varchar                                                                          not null,
    book_title  varchar,
    book_page   integer,
    website_url varchar,
    source      varchar                                                                          not null,
    tags        varchar(128)[] default (ARRAY []::character varying[])::character varying(128)[] not null,
    rating      integer        default 0                                                         not null,
    notes       text           default ''::text                                                  not null,
    duration    varchar
);

alter table recipes
    owner to loco;

create table ingredients_in_recipes
(
    created_at     timestamp default CURRENT_TIMESTAMP not null,
    updated_at     timestamp default CURRENT_TIMESTAMP not null,
    id             serial
        primary key,
    recipes_id     integer                             not null
        constraint "fk-ingredients_in_recipes-recipes"
            references recipes
            on update cascade on delete cascade,
    ingredients_id integer                             not null
        constraint "fk-ingredients_in_recipes-ingredients"
            references ingredients
            on update cascade on delete cascade,
    quantities_id  integer                             not null
        constraint "fk-ingredients_in_recipes-quantities"
            references quantities
            on update cascade on delete cascade
);

alter table ingredients_in_recipes
    owner to loco;

create table seaql_migrations
(
    version    varchar not null
        primary key,
    applied_at bigint  not null
);

alter table seaql_migrations
    owner to loco;

create table shoppinglists
(
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null,
    id         serial
        primary key,
    name       varchar                             not null
);

alter table shoppinglists
    owner to loco;

create table ingredients_in_shoppinglists
(
    created_at       timestamp default CURRENT_TIMESTAMP not null,
    updated_at       timestamp default CURRENT_TIMESTAMP not null,
    id               serial
        primary key,
    in_basket        boolean                             not null,
    shoppinglists_id integer                             not null
        constraint "fk-ingredients_in_shoppinglists-shoppinglists"
            references shoppinglists
            on update cascade on delete cascade,
    ingredients_id   integer                             not null
        constraint "fk-ingredients_in_shoppinglists-ingredients"
            references ingredients
            on update cascade on delete cascade,
    quantities_id    integer                             not null
        constraint "fk-ingredients_in_shoppinglists-quantities"
            references quantities
            on update cascade on delete cascade,
    recipe_id        integer
        constraint "fk-ingredient_in_recipes-recipe-id"
            references recipes,
    note             varchar
);

alter table ingredients_in_shoppinglists
    owner to loco;

create table users
(
    created_at                 timestamp default CURRENT_TIMESTAMP not null,
    updated_at                 timestamp default CURRENT_TIMESTAMP not null,
    id                         serial
        primary key,
    pid                        uuid                                not null,
    email                      varchar                             not null
        unique,
    password                   varchar                             not null,
    api_key                    varchar                             not null
        unique,
    name                       varchar                             not null,
    reset_token                varchar,
    reset_sent_at              timestamp,
    email_verification_token   varchar,
    email_verification_sent_at timestamp,
    email_verified_at          timestamp
);

alter table users
    owner to loco;

