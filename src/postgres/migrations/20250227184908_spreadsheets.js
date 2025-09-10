/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("spreadsheets", (table) => {
        // Clé primaire auto-incrémentée
        table.increments("spreadsheet_id").primary();

        // Données textuelles
        table.string("warehouse_name").notNullable(); // ex: "Коледино"
        table.string("geo_name").notNullable(); // ex: "Центральный федеральный округ"

        // Tarifs livraison boîte (client)
        table.float("box_delivery_base").notNullable(); // ex: "48" → 48.0
        table.float("box_delivery_coef_expr").notNullable(); // ex: "160" → 160.0
        table.float("box_delivery_liter").notNullable(); // ex: "11,2" → 11.2

        // Tarifs livraison boîte (marketplace)
        table.float("box_delivery_marketplace_base").notNullable(); // ex: "40"
        table.float("box_delivery_marketplace_coef_expr").notNullable(); // ex: "125"
        table.float("box_delivery_marketplace_liter").notNullable(); // ex: "11"

        // Tarifs stockage boîte
        table.float("box_storage_base").notNullable(); // ex: "0,14" → 0.14
        table.float("box_storage_coef_expr").notNullable(); // ex: "115"
        table.float("box_storage_liter").notNullable(); // ex: "0,07" → 0.07

        // Timestamps
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        // Index optionnels pour performance
        table.index("warehouse_name");
        table.index("geo_name");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("spreadsheets");
}
