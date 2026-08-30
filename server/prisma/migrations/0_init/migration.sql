-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '☕',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items_default" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '☕',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_items_default_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" SERIAL NOT NULL,
    "items" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Order numbers are customer-facing and start at 100
ALTER SEQUENCE "orders_order_number_seq" RESTART WITH 100;

-- Status lifecycle guard
ALTER TABLE "orders"
    ADD CONSTRAINT "orders_status_check"
    CHECK ("status" IN ('pending', 'preparing', 'ready', 'completed'));

-- Realtime: broadcast row changes over LISTEN/NOTIFY. The API server LISTENs
-- on the 'table_changes' channel and relays payloads to WebSocket clients.
CREATE OR REPLACE FUNCTION notify_table_change() RETURNS trigger AS $$
DECLARE
    payload text;
BEGIN
    payload := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'eventType', TG_OP,
        'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        'old', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END
    )::text;

    -- pg_notify payloads are capped at ~8000 bytes; an oversized payload would
    -- abort the triggering statement. Fall back to an id-only payload that the
    -- API server hydrates before broadcasting.
    IF octet_length(payload) > 7000 THEN
        payload := jsonb_build_object(
            'table', TG_TABLE_NAME,
            'eventType', TG_OP,
            'partial', true,
            'id', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) -> 'id' ELSE to_jsonb(NEW) -> 'id' END
        )::text;
    END IF;

    PERFORM pg_notify('table_changes', payload);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_items_notify
    AFTER INSERT OR UPDATE OR DELETE ON "menu_items"
    FOR EACH ROW EXECUTE FUNCTION notify_table_change();

CREATE TRIGGER orders_notify
    AFTER INSERT OR UPDATE OR DELETE ON "orders"
    FOR EACH ROW EXECUTE FUNCTION notify_table_change();

-- Factory reset: wipe orders, restore the menu from the seed table
CREATE OR REPLACE FUNCTION factory_reset() RETURNS void AS $$
BEGIN
    DELETE FROM "orders" WHERE true;
    DELETE FROM "menu_items" WHERE true;

    INSERT INTO "menu_items" ("id", "name", "description", "price", "category", "image", "popular", "available")
    SELECT "id", "name", "description", "price", "category", "image", "popular", "available"
    FROM "menu_items_default";

    PERFORM setval(
        pg_get_serial_sequence('menu_items', 'id'),
        (SELECT COALESCE(MAX("id"), 1) FROM "menu_items")
    );

    ALTER SEQUENCE "orders_order_number_seq" RESTART WITH 100;
END;
$$ LANGUAGE plpgsql;

-- Seed: the 12 default drinks (canonical copy — src/lib/menu.js mirrors this)
INSERT INTO "menu_items_default" ("id", "name", "description", "price", "category", "image", "popular", "available") VALUES
    (1,  'Klassisk Espresso',      'Rik, kraftfull single-origin espresso med en sammetslen crema',        35, 'espresso',  '☕', true,  true),
    (2,  'Vanilj Latte',           'Len espresso med ångad mjölk och hemgjord vaniljsirap',                52, 'latte',     '🥛', true,  true),
    (3,  'Karamell Macchiato',     'Espresso med mjölkskum och ett drizzle av smörig karamell',            58, 'latte',     '🍮', true,  true),
    (4,  'Mocha Delight',          'Belgisk choklad möter espresso, toppad med vispgrädde',                55, 'mocha',     '🍫', false, true),
    (5,  'Cold Brew',              '18 timmars långsam brantning för en len, naturligt söt avslutning',    48, 'cold',      '🧊', true,  true),
    (6,  'Chai Te Latte',          'Kryddig chai med ångad havremjölk och en hint av honung',              50, 'tea',       '🍵', false, true),
    (7,  'Matcha Latte',           'Ceremoniell matcha vispat med valfri mjölk',                           55, 'tea',       '🍃', false, true),
    (8,  'Americano',              'Espresso utspädd med hett vatten för en ren, frisk kopp',              38, 'espresso',  '☕', false, true),
    (9,  'Cappuccino',             'Lika delar espresso, ångad mjölk och molnliknande skum',               45, 'espresso',  '☁️', true,  true),
    (10, 'Affogato',               'En kula vaniljglass dränkt i het espresso',                            60, 'specialty', '🍨', false, true),
    (11, 'Lavendel Honung Latte',  'Blommig lavendel och vildblommshonung med silkeslen ångad mjölk',      58, 'specialty', '💜', true,  true),
    (12, 'Isad Kokosnöt Mocha',    'Chokladespresso hälld över kokosmjölk och is',                         55, 'cold',      '🥥', false, true);

INSERT INTO "menu_items" ("id", "name", "description", "price", "category", "image", "popular", "available")
SELECT "id", "name", "description", "price", "category", "image", "popular", "available"
FROM "menu_items_default";

SELECT setval(
    pg_get_serial_sequence('menu_items', 'id'),
    (SELECT COALESCE(MAX("id"), 1) FROM "menu_items")
);
