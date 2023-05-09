import { db } from "../database";
import profiles from "./data/profiles.json";
import weights from "./data/weights.json";

async function seed() {
  await db.deleteFrom("profiles").execute();
  await db.deleteFrom("weights").execute();

  await db
    .insertInto("profiles")
    .values(profiles)
    .returningAll()
    .executeTakeFirstOrThrow();

  await db
    .insertInto("weights")
    .values(weights)
    .returningAll()
    .executeTakeFirstOrThrow();
}

seed();
