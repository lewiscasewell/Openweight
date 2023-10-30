import * as dotenv from "dotenv";

const path =
  process.env.NODE_ENV === "production"
    ? ".env"
    : `.env.${process.env.NODE_ENV}`;

dotenv.config({ path, override: true });

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
