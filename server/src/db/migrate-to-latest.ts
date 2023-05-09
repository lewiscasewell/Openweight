import * as path from "path";
import { promises as fs } from "fs";
import { config } from "./../config";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from "kysely";
import { Pool } from "pg";
import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Profiles {
  id: string;
  supabase_user_id: string;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  name: string;
  gender: string | null;
  dob_at: Timestamp | null;
  height: number | null;
  height_unit: string | null;
  target_weight: number | null;
  target_weight_unit: string | null;
  default_weight_unit: Generated<string>;
  activity_level: string | null;
  calorie_surplus: number | null;
}

export interface Weights {
  id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  supabase_user_id: string;
  weight: number;
  date_at: Timestamp;
  unit: string;
  profile_id: string;
}

export interface DB {
  profiles: Profiles;
  weights: Weights;
}

async function migrateToLatest() {
  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: config.databaseUrl,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve("dist/src/db/migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
