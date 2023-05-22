import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("weights")
    .addColumn("isDeleted", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: any): Promise<void> {
  await db.schema().alterTable("weights").dropColumn("isDeleted").execute();
}
