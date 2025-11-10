-- UPSERT statements to add tags to ingredients based on ID

-- Generated from ingredients.csv

-- Uses approach #5: Removing Duplicates When Merging

-- Works with PostgreSQL array type (text[])

-- This will merge new tags with existing tags and remove duplicates


INSERT INTO ingredients (id, name, tags)
VALUES (2074, 'metanium cream', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1138, 'Pizza sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (5, 'apple cider vinegar', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2132, 'baby crisps', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2404, 'gyoza', ARRAY['frozen-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2423, 'stirfry vegetables', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2245, 'pak choi', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2443, 'shredded wheat cereal', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2282, 'sage', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1349, 'freezer bags', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (24, 'balsamic drizzle', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (25, 'balsamic vinegar', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (28, 'barbeque sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (30, 'basmati rice', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (39, 'bircher muesli', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (4, 'anti nausea ginger capsules', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (41, 'biscotti', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (45, 'black olives', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (6, 'apple juice', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (51, 'bran flakes', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (52, 'bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (53, 'bread crumbs', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (68, 'capers', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (932, 'chutney', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2015, 'puy lentils', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (42, 'biscuit cutting thing', ARRAY['household', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (104, 'cider vinegar', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (112, 'coconut milk', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (113, 'coconut oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2075, 'wholewheat fussili pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (134, 'cuppa soup', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2133, 'wholemeal bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2007, 'nose spray', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2365, 'dried chilli flakes', ARRAY['herbs-spices', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1181, 'fish fillets', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1377, 'sliced turkey', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2405, 'sushi salmon & avocado', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2424, 'M&S Stir Fry Veg', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1404, 'Bagels', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1819, 'bulgar wheat', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2227, 'chicken legs', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2526, 'ready made rice', ARRAY['ready-meals', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2114, 'chicken slices', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1632, 'wrapping paper', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1242, 'vanish', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1638, 'sliced bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1030, 'Maultaschen', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1669, 'yellow pepper', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2062, 'baby biscuits', ARRAY['baby-products', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1869, 'Pringles', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1060, 'chili powder', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1090, 'Udon noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1095, 'green lentin', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1689, 'gravy', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1894, 'lean minced beef', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1904, 'frozen berries', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1914, 'prawns', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1525, 'Mackerel', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1924, 'fine cornmeal', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2076, 'pre-cooked rice', ARRAY['ready-meals', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2552, 'mixed seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2115, 'Krisp rolls', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2797, 'emmental slices', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2664, 'wholemeal spaghetti pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2425, 'M&S Stir Fry sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (143, 'dijon mustard', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2820, 'buckwheat grains', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (154, 'dried split peas', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1543, 'desert', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (170, 'felipe cereal', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (176, 'fig rolls', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (179, 'flammkuchen', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (181, 'flat bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (186, 'for frying', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (202, 'fresh stirfry noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (206, 'frozen bread baguettes', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (210, 'fruit & nut cereal', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (214, 'garam masala', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (220, 'gaviscon', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (224, 'giant cous-cous', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (225, 'giant couscous', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (234, 'green lentils', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (248, 'halloween sweets', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (251, 'harisa', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (252, 'harissa', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (256, 'hoisin sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2077, 'teething rusks', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2553, 'dried cranberries', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (262, 'jar of artichockes in oil', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (264, 'jar of red peppers', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2116, 'Siro oaty sugar free biscuits', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (403, 'red lentils', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1645, 'bread flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (282, 'lemonade', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1639, 'fresh lemongrass', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2229, 'roast chicken', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2407, 'Bubble bath', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (292, 'lime juice', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (296, 'long grain rice', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2426, 'watermelon', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (810, 'cereal bars', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1343, 'split peas', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2009, 'pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (798, 'moisturizer', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (816, 'Quinoa', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1405, 'Marmite', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (850, 'Sun screen', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1609, 'Nosecco', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1243, 'apple puree', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1446, 'Veggie straws', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1071, 'green', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1076, 'kidney', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1096, 'salt-free broth', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1870, 'Ibuoprofen', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1690, 'cream crackers', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1136, 'fresh oregano', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1710, 'garlic oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1526, 'Limoncello', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1965, 'roast turkey', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (257, 'honey', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (263, 'jar of red pepper', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (267, 'ketchup', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2859, 'garam masala mix', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2408, 'Easy peelers', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2427, 'whipped cream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2529, 'chicken breasts skinless', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2488, 'roast beef', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (289, 'light soy sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (293, 'lime leaves', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (295, 'liquorice', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (303, 'maple syrup', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2762, 'white tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (307, 'masks', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (309, 'mayonnaise', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (315, 'mirin', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (316, 'mixed nuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (323, 'müsli', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (324, 'mustard', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (327, 'noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (329, 'nutmeg graiting', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (330, 'nut roast', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (332, 'olbas oil', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (337, 'orange juice', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (343, 'paella rice', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (353, 'peanut butter', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (354, 'peanuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (355, 'pearl barley', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (365, 'pie crust', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (366, 'pine nuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (367, 'piqeo', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (368, 'pitta bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (370, 'pizza', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (371, 'pizza bases', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (372, 'pizza dough', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (383, 'porridge', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (388, 'pumpkin seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (392, 'quinoa', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (395, 'rapeseed oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (397, 'raspberry jam', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (398, 'ready made quiche', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (409, 'red wine vinegar', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (410, 'rice', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (411, 'rice cracker', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (412, 'rice pudding', ARRAY['ready-meals', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (413, 'rice vinegar', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2555, 'dried apricots', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (416, 'risotto rice', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (418, 'roasted red peppers', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (420, 'rooibos tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (430, 'samolina', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2409, 'Tea cake', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (16, 'baby sweetcorn', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (436, 'sesame oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (928, 'baguette', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (440, 'short crust pastery', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2287, 'clementines', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (444, 'sliced', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2489, 'fresh thyme', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1137, 'Cod', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (454, 'snack a jacks', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (456, 'soup', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (488, 'tabasco', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2763, 'Mia shoes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (462, 'sponge finger biscuits', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (476, 'sultanas', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (478, 'sun-dried tomatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (480, 'sweet chilli sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (768, 'Tiramisu', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1564, 'low salt beed stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (817, 'Polenta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1814, 'tomato paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1634, 'Coconut cream', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1871, 'Hot cross buns', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1062, 'corn tortillas', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (875, 'prosecco', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1072, 'lemon juice', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1082, 'Smooth peanut butter', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1097, 'spelt flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1691, 'dried figs', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1117, 'barbeque charcoal', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1696, 'soup can', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1132, 'pineaple', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1507, 'dried porcini mushrooms', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1901, 'Easy meals', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1906, 'Mixed beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1527, 'Calpol', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2329, 'fishy dishy', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (427, 'salmon', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (429, 'salted butter', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (463, 'spreadable butter', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (433, 'seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (437, 'sesame seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2469, 'Green pea fusilli', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2580, 'apricots and peach yoghirt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (50, 'borlotti beans / pinto beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (453, 'smoked salmon', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (455, 'sodastream bottle', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (793, 'Breakfast tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (459, 'soy sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1635, 'canned bamboo shoots', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (487, 'szechuan pepper', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (467, 'sriracha sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (469, 'stirfry', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (471, 'straws', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (477, 'sun-blush tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (479, 'sunflower seed oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (489, 'taco making kit', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (490, 'tagine paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (492, 'tahini', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (493, 'tamarind paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (494, 'tarragon', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (495, 'teriyaki sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (496, 'thai green curry paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (497, 'the pink stuff', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1985, 'pate', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (501, 'tin foil', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (505, 'tofu', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (512, 'tomate frito', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (514, 'tomato ketchup', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (519, 'tomato sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (521, 'tortilla', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (523, 'to taste', ARRAY['other'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (524, 'tumeric', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (525, 'tuna', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (527, 'tzaziki', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (529, 'unsalted peanutes', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (530, 'unsalted pistachios, shelled', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (532, 'vegetable oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (537, 'vitamins and supplemetns', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (538, 'walnuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (540, 'water', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (546, 'white wine vinegar', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (547, 'whole almonds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (548, 'whole milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (549, 'worcestershire sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (551, 'yorkshire pudding', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (553, 'Pasta Al', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (555, 'Turkey', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1184, 'fajita set', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1641, 'kaffir lime leaves', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1986, 'windscreen unfreezer', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1154, 'nutella', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1347, 'Horseradish', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1365, 'chapati flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2411, 'courgett', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2214, 'lemon yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2689, 'bolognaise sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2470, 'Red lenti fusilli', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2289, 'petit filous', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (831, 'Cling film', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1078, 'bread slices', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1396, 'harissa paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (66, 'calvo nero', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2491, 'chicken stock paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2581, 'pre-cooked salmon', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1220, 'cornflakes', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2765, 'Mia trousers', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (895, 'chocolate milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2430, 'coffee cake mix', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1618, 'Baby apple puree pouch', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1636, 'fresh lime leaves', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1857, 'low-salt soy sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1872, 'Baby pouches', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1058, 'couscous', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1063, 'unsalted stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1083, 'buckwheat soba noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1088, 'cream cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1093, 'fish sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1692, 'tissues', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1902, 'baby snacks', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1912, 'raisins', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1528, 'Calpol tablets', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1722, 'Strepsils', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1747, 'dry sherry', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (668, 'Birthday card', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (670, 'Honey', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (690, 'Pine nuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1549, 'white bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1348, 'Cot sheets', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2849, 'Postre', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2159, 'Milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (726, 'Passatta', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2649, 'Simple facewipes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1155, 'biscuits', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (732, 'Canned peaches', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (78, 'celery stalks', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2471, 'Turkey slices', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (814, 'Tinned tuna', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1397, 'chocolate mousse', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2290, 'water wipes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1409, 'Raspberry yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2512, 'dairylea ham & cheese lunchbox', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (731, 'Clipper organic everyday tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1089, 'Appletiser', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (733, 'Sleepy tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (987, 'Kartoffelsalat', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1414, 'tinned green lentils', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1607, 'cake', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1619, 'rolled oats', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (848, 'Aloe vera', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1246, 'Chia seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2055, 'Swedish rusks', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1637, 'fresh green chilli', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2766, 'Okras', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2061, 'Crumpets', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (750, 'Decaf tea (Yorkshire Gold)', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1459, 'cocoa powder', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1069, 'marinara sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1074, 'sesame tahini', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1079, 'wide rice noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1868, 'Short sleeve vest', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1873, 'Water bottle', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1524, 'muesli', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1723, 'Neurofen', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1758, 'oats', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2513, 'bread sticks', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2493, 'brocollin', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2691, 'Tuna & Sweetcorn sandwhich filler', ARRAY['ready-meals', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2472, 'vanilla icecream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2452, 'chicken mince', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (88, 'chicken stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2890, 'decongestant', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2374, 'sea bass fillets', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2161, 'wheetabix', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2514, 'beef gravy', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2672, 'skinless cod', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2692, 'Pork meatballs', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2473, 'Baby vitamins', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2273, 'nutritional yeast', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2868, 'whole chicken', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2749, 'White tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2891, 'Saline drops', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2806, 'Cotton ear buds', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2143, 'milled seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2750, 'baby bear ham', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2415, 'Mia oaty bars', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2218, 'cod', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2892, 'Puppy pad', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2769, 'petit filous unsweeted', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2807, 'Simple moisturises', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2164, 'toothbrush for mia', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2435, 'coffee', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1550, 'philadelphia', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2455, 'marigold gloves', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2086, 'cooked green lentils', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2496, 'vegemite', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2893, 'Mia water bottle', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2751, 'mini cheddars', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2808, 'Charlie B prefab meal', ARRAY['ready-meals'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2165, 'toothpaste for mia', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2456, 'baby ham', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2752, 'pukka relax tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2785, 'ginger tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2108, 'stale bread', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2166, 'dental floss', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2655, 'garlc', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2634, 'bread rolls', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2518, 'coffee beans', ARRAY['beverages', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2277, 'mussels', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2457, 'pasta sauce', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2734, 'rice cakes', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2753, 'Pukka Organic Morning Berry Tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2872, 'Croissants', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2379, 'taglietelle pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2873, 'Muffins', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2499, 'star anise', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2418, 'yoghurt pouches', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2148, 'frozen mixed vegetables', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2857, 'ground cardamon', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2419, 'kids ham', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2223, 'cardamom pods', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2755, 'broccoli1', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2874, 'water cups', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2500, 'ground cinammon', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2111, 'Rigatoni pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2130, 'AA batteries', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (21, 'baking parchment', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2812, 'wafer thin chicken slices', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (185, 'flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2224, 'low salt chicken stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2261, 'aveeno baby gentle bath & wash', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2440, 'sandwhich bags', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (821, 'Nappies', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2169, 'baby bel', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (23, 'baking powder', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (37, 'beer', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (47, 'black tea', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (55, 'brew dogs', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (60, 'brown sugar', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (101, 'chocolate', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (114, 'coconut water', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2875, 'water pitchers', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2, 'all-purpose flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (71, 'cashew nuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (72, 'cashews nuts', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (73, 'caster sugar', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (111, 'cocacola', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (116, 'coke cans', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (121, 'cornflour', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (130, 'crisps', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (809, 'Baby food pots', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1843, 'Regular tampons', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2073, 'baby sudocream', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1964, 'Wellbaby Multi-vitamin Drops', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (138, 'dark brown sugar', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (140, 'desiccated coconut', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (150, 'dried cherries', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (151, 'dried fuseli pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (155, 'dried tagliatelle', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (156, 'dry cider', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (158, 'dry white wine', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (163, 'egg noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (178, 'flaked almonds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (180, 'flapjacks', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (182, 'flax seeds', ARRAY['nuts-seeds'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (194, 'fresh gnocchi', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (197, 'fresh pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (200, 'fresh salsa', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (212, 'fusili', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (213, 'fussili', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (245, 'guacamole', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (246, 'gummy bears', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (254, 'healthy sweet snacks', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (258, 'houmous', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (828, 'Crisps', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (995, 'Apfelsaft', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1091, 'wheat beer', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1685, 'Simple Night Cream', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (259, 'hummus', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (261, 'icing sugar', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (277, 'lasagna sheets', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (299, 'madeleines', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (341, 'orzo', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (342, 'orzo pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (359, 'penne', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (363, 'pesto', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (373, 'plain flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (408, 'red wine', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (460, 'spaghetti', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (472, 'strong flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (936, 'ground almond', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (833, 'Shandy', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1092, 'baby formula', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1686, 'Simple Day Cream', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (473, 'sugar', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (491, 'taglietelle', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1556, 'dried macaroni', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (515, 'tomato pasata', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (520, 'tortelini / ravioli / gnocci', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (534, 'vermicelli rice noodles', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (545, 'white wine', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (550, 'yeast', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (985, 'Pregnacare Breastfeeding vitamins', ARRAY['medicine'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (571, 'easy pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (583, 'Nappy bags', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (841, 'haribo', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (604, 'dried penne pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1098, 'Formula bottles', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1687, 'Ella''s kitchen food pouch', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (702, 'fussili pasta', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (808, 'Baby wipes', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (721, 'whole UHT milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (723, 'Dark chocolate with orange', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1688, 'low salt low sugar baked beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (13, 'baby arugula', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1568, 'sirloin steak', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (32, 'bay leaves', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (38, 'bin bag 40l', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (46, 'black pepper', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2318, 'Tinned pears', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (80, 'chard', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (517, 'tomato puree', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1623, 'eggs', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (12, 'avocados', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (14, 'baby plum tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (15, 'baby spinach leaves', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (22, 'baking potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (36, 'beef stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (930, 'bicarbonate of soda', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (43, 'black beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (44, 'blackberries', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (49, 'blue cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (48, 'blueberries', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (54, 'breadcrumbs', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (56, 'broad beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (59, 'brown lentils', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (61, 'brussel sprouts', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (62, 'burrata', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (64, 'butter beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (65, 'butternut squash', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (67, 'cannellini beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (70, 'carrots', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (74, 'cauliflower', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (75, 'celeriac', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (76, 'celery', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (77, 'celery stalk', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (79, 'celery sticks', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (81, 'charlotte potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (82, 'chcken breasts', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2876, 'scones', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (85, 'cherry tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (87, 'chicken breasts', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (89, 'chicken thighs', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (91, 'chicory', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (765, 'Cookies', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (434, 'self raising flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (531, 'vanilla extract', ARRAY['baking', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (92, 'chili', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (93, 'chili flakes', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (94, 'chili paste', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (97, 'chinese 5-spice powder', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (98, 'chinese leaves', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (105, 'cinnamon', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (106, 'cleaning utensils', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (107, 'clothes stain remover', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (108, 'clove', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (109, 'cloves', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (119, 'coriander seeds', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (120, 'corn', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (122, 'corn on the cob', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (123, 'cottage cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (124, 'cotton wool wipes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (127, 'cream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (31, 'bay leaf', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (33, 'beef brisket pecho', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (128, 'creme fraiche', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (132, 'cumin', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (231, 'greek yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1608, 'fresh milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1450, 'Ariel Gel', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (919, 'fairy Non bio washing up liquid', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1515, 'mixed peppers', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1744, 'scourers', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (133, 'cumin seeds', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (135, 'currey power', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (136, 'curry powder', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (137, 'dairy lea', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (139, 'dates', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (141, 'detergent cloths', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (142, 'dettol wipes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (144, 'dill', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (146, 'double cream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (147, 'drain cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (148, 'dried basil', ARRAY['herbs-spices', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (149, 'dried caneloni', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (152, 'dried marjoram', ARRAY['herbs-spices', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (153, 'dried oregano', ARRAY['herbs-spices', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (157, 'dry dill', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (159, 'ecover bathroom cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (160, 'ecover fabric softener', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (161, 'ecover multiaction surface cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (166, 'emmental', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (145, 'dishwasher tablets', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (168, 'english mustard powder', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (169, 'fajita meat', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (171, 'fennel', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (172, 'fennel bulbs', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (173, 'fennel seeds', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (177, 'fine sea salt', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (183, 'floor cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (184, 'floss', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (188, 'free range chicken thighs & drumsticks', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (189, 'fresh basil', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (191, 'fresh coriander', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (192, 'fresh coriander leaves', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (193, 'fresh dill', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2837, 'premade pasta sauce', ARRAY['condiments', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1, 'air-dried ham', ARRAY['meat-poultry', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (8, 'apricots', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (9, 'artichokes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (11, 'aubergine', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (17, 'bacon', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (19, 'bacon lardons', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (20, 'baked beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (26, 'bananas', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (35, 'beef roasting joint', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (96, 'chillis', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (95, 'chili sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (99, 'chipotle sauce', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (100, 'chives', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (103, 'chorizo', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (115, 'coconut yoghurt', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (117, 'cooked chicken meat', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (118, 'coriander', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2877, 'napkins', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (196, 'fresh parsley', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (198, 'fresh pea shoots', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (199, 'fresh rosemary', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (204, 'fried onions', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (208, 'frozen petits pois', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (209, 'frozen spinach', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (211, 'fruity babe yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (215, 'garbanzos', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (216, 'garlic', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1378, 'Persil Bio laundry liquid', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (219, 'garlic powder', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (221, 'gem lettuce', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (222, 'gherkins (normal)', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (223, 'gherkins (spicy)', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (226, 'ginger', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (227, 'glass cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (228, 'goat''s cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (229, 'goats cheese', ARRAY['dairy', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (230, 'gouda', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (232, 'green beans', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (233, 'green chilli', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (235, 'green peas', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (236, 'green peppers', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (238, 'ground coriander', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (239, 'ground cumin', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (240, 'ground ginger', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (241, 'ground nutmeg', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (242, 'ground tumeric', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (243, 'gruyere', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (244, 'gruyère cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (247, 'halloumi', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (249, 'ham hock', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (250, 'ham slices', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (253, 'hashbrowns', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (131, 'cucumber', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (10, 'asparagus', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (260, 'ice-berg', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (266, 'kebab skewers', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (268, 'kidney beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (270, 'kiwis', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (272, 'large brocolli', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (276, 'large russet potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (278, 'laundry detergent', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (284, 'lemon grass', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (286, 'lemon sorbet', ARRAY['snacks'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (288, 'lettuce', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (290, 'lime', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (294, 'limescale remover', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (298, 'low sodium chicken broth', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (300, 'manchego', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (302, 'mango', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (304, 'marinated chicken', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (306, 'mascarpone', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1461, 'beef chuck', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (310, 'meatballs', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1081, 'Beef steaks', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1633, 'low salt vegetable stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1253, 'mixed herbs', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1066, 'Ground pork', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1086, 'dried thyme', ARRAY['herbs-spices', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1323, 'cream cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1511, 'kitchen cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (265, 'kale', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (269, 'kitchen roll', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (271, 'lamb mince', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (275, 'large onion', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (279, 'leek', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (281, 'lemon', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (283, 'lemon gras', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (285, 'lemons', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (287, 'lemon thyme', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (57, 'broccoli', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2878, 'Soya mikk', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1206, 'sweetcorn cob', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2421, 'fresh sweetcorn', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2441, 'Moth traps', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2461, 'lancshire fram natural yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (291, 'lime descaler', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (297, 'long life milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (301, 'mangetout', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (305, 'maris pipe potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (311, 'milk', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (312, 'mince meat', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (313, 'mint', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (317, 'mixed salad', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (318, 'mozarella', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (319, 'mozarella tiny balls', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (320, 'mozzarella', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (321, 'mushroom', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (325, 'natural yogurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (326, 'new potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (328, 'nutmeg', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (331, 'oatly barrista oat milk', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (333, 'olive oil', ARRAY['oils-fats'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (334, 'olives', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (335, 'onion', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (338, 'oranges', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (339, 'oregano', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (340, 'organica bin bag', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (344, 'pancetta', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (345, 'paprika', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (346, 'parmesan', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (350, 'parsley', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (351, 'parsnip', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (352, 'parsnips', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (356, 'pears', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (357, 'peas', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (358, 'pecorino romano', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (360, 'pepper', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (361, 'peppercorns', ARRAY['herbs-spices', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (362, 'pepperoni', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (364, 'petit reblochon', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (374, 'plain yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (375, 'plums', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (376, 'pomegranate', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (377, 'pomegranate seeds', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (378, 'pomegranete seeds', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (379, 'pork chops', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (380, 'pork loin with skin', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (381, 'pork medallion', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (382, 'pork mince', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (384, 'potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (385, 'prosciutto', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (386, 'puff pastry', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (387, 'pumpkin', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (389, 'quark', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (390, 'queso  rallado/cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (391, 'quick meat', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (393, 'radishes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (394, 'random greens charlotte', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (396, 'raspberries', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (399, 'reblochon', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (400, 'red cabbage', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (401, 'red chilli', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (402, 'red chillies', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1581, 'Grapes', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (404, 'red onion', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (407, 'red peppers', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (414, 'ricotta', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (422, 'rosemary sprigs', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (424, 'saffron', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (426, 'salami', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (428, 'salt', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (432, 'sausages', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (438, 'shallots', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (442, 'shower cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (446, 'small celery', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (448, 'small onion', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (450, 'smoked, cooked ham', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (452, 'smoked paprika', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (458, 'soured cream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (464, 'spring greens', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (466, 'squash', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (468, 'steaks', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (470, 'strawberries', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (474, 'sugar snap', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (482, 'sweet onion', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1555, 'grated cheddar', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (805, 'shampoo', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (3, 'all spice', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (207, 'frozen peas', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1417, 'lean mince meat', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2572, 'baby shampoo', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1452, 'little yeo yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1067, 'fresh ricotta cheese', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1087, 'collard greens', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1522, 'fairy non bio laundry liquid', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1736, 'kefir', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (415, 'ripe vine tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (417, 'roasted butternut squash', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (419, 'rocket', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (421, 'rosemary', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (423, 'rump of beef fillet', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (431, 'satsumas', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (435, 'serrano ham', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (441, 'shortcrust pastry', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (443, 'single cream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (445, 'small bananas', ARRAY['fruits', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (447, 'small fruity yoghurts', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (449, 'smoked bacon lardons', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (451, 'smoked pancetta / lardons', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (457, 'sour cream', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2816, 'Oat cakes', ARRAY['snacks', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (465, 'spring onions', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (475, 'sugar snap peas', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (498, 'thyme', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (502, 'tinned chopped tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (503, 'tinned fruit chaz', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (504, 'tinned plum tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (506, 'toilet brush heads', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (507, 'toilet cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (508, 'toilet limescale tablets', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (509, 'toilet roll', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (510, 'toilet things for toilet bowl', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (511, 'toilet wipes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (526, 'turmeric', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (528, 'unsalted butter', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (533, 'vegetable stock', ARRAY['condiments'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (535, 'viakal', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (536, 'vine tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (539, 'washing-up liquid', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (541, 'watercress', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (543, 'wet wipes', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (544, 'white beans', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (800, 'peaches', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (806, 'conditioner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (125, 'courgette', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (425, 'salad bag', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (513, 'tomatoes', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (542, 'waxy potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (584, 'Dishwasher salt', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (807, 'shower gel', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (587, 'toilet paper', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (590, 'Satsumas', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (825, 'Sponges', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (174, 'feta', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1240, 'stain remover', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (614, 'turkey breast', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1068, 'onion powder', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (620, 'melon', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1325, 'yellow onions', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1523, 'kids plain yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (669, 'washing-up liquid surcare', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (691, 'Salmon fillets', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2639, 'potato waffles', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (7, 'apples', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (680, 'Blueberry yoghurt', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (840, 'cherries', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2879, 'paper straw', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (486, 'sweet potato fries', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (483, 'sweet potato', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (484, 'sweet potatoe', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (485, 'sweet potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (481, 'sweetcorn', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (692, 'Green beans', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (698, 'Lime', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (703, 'Fresh spinach', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (710, 'turkey mince', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (715, 'tinned sweetcorn', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (718, 'fresh red chilli', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (722, 'dettol wipes (fragrance free)', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (725, 'Mozarella', ARRAY['dairy'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (832, 'Jay cloth', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (729, 'Floor cleaner', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1241, 'ecover dishwasher tablets', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1449, 'Black bin bags', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (918, 'fairy fabric softener', ARRAY['household'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (749, 'nectarines', ARRAY['fruits'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1064, 'maris piper potatoes', ARRAY['vegetables', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1084, 'edamame', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1648, 'mini cucumber', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1114, 'cayenne pepper', ARRAY['herbs-spices'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2573, 'baby shower gel', ARRAY['baby-products'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2131, 'cress', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2170, 'non-alchoholic beers', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2187, 'wholemeal flour', ARRAY['grains', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2383, 'marinated artichoke hearts', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2422, 'ticktock chai relax', ARRAY['beverages'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2442, 'fish fingers', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (1842, 'baby cucumber', ARRAY['vegetables'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (719, 'bacon cubes', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2244, 'bean curd', ARRAY['dairy-alternatives'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (34, 'beef mince', ARRAY['meat-poultry'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (2048, 'boneless white fish', ARRAY['fish-seafood'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );

INSERT INTO ingredients (id, name, tags)
VALUES (90, 'chickpeas', ARRAY['legumes', 'carbohydrate'])
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    tags = (
        SELECT ARRAY(
            SELECT DISTINCT unnest(COALESCE(ingredients.tags, ARRAY[]::text[]) || EXCLUDED.tags)
        )
    );