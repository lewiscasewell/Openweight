import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("weights")
    .alterColumn("date_at", (col) => col.setDataType("timestamptz"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("weights")
    .alterColumn("date_at", (col) => col.setDataType("timestamptz"))
    .execute();
}
