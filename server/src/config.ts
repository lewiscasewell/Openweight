import * as dotenv from "dotenv";
import { ConnectionConfig } from "pg";

dotenv.config();

export interface Config {
  readonly databaseUrl: string;
  readonly supabase: {
    readonly supabaseUrl: string;
    readonly supabaseKey: string;
  };
}

export const config: Config = Object.freeze({
  supabase: Object.freeze({
    supabaseUrl: getEnvVariable("SUPABASE_URL"),
    supabaseKey: getEnvVariable("SUPABASE_KEY"),
  }),
  databaseUrl: getEnvVariable("DATABASE_URL"),
});

function getEnvVariable(name: string): string {
  if (!process.env[name]) {
    throw new Error(`environment variable ${name} not found`);
  }

  return process.env[name]!;
}
