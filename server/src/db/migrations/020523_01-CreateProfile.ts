import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("profiles")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("supabase_user_id", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("gender", "text")
    .addColumn("dob_at", "date")
    .addColumn("height", "integer")
    .addColumn("height_unit", "text")
    .addColumn("target_weight", "integer")
    .addColumn("target_weight_unit", "text")
    .addColumn("default_weight_unit", "text", (col) =>
      col.notNull().defaultTo("kg")
    )
    .addColumn("activity_level", "text")
    .addColumn("calorie_surplus", "integer")
    .execute();
}

export async function down(db: any): Promise<void> {
  await db.schema().dropTable("profiles").execute();
}
