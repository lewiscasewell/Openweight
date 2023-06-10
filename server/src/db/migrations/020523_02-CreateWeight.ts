import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("weights")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("created_at", "timestamptz", (col) => col.notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.notNull())
    .addColumn("supabase_user_id", "text", (col) => col.notNull())
    .addColumn("weight", "double precision", (col) => col.notNull())
    .addColumn("date_at", "date", (col) => col.notNull())
    .addColumn("unit", "text", (col) => col.notNull())
    .addColumn("profile_id", "text", (col) =>
      col.references("profiles.id").notNull().onDelete("cascade")
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("weights").execute();
}
