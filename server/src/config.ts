import * as dotenv from "dotenv";
import { ConnectionConfig } from "pg";

dotenv.config();

export interface Config {
  readonly port: number;
  readonly database: ConnectionConfig;
  readonly databaseUrl: string;
}

export const config: Config = Object.freeze({
  port: parseInt(getEnvVariable("PORT"), 10),
  databaseUrl: getEnvVariable("DATABASE_URL"),
  database: Object.freeze({
    database: getEnvVariable("DATABASE"),
    host: getEnvVariable("DATABASE_HOST"),
    user: getEnvVariable("DATABASE_USER"),
    port: parseInt(getEnvVariable("DATABASE_PORT"), 10),
    password: getEnvVariable("DATABASE_PASSWORD"),
  }),
});

function getEnvVariable(name: string): string {
  if (!process.env[name]) {
    throw new Error(`environment variable ${name} not found`);
  }

  return process.env[name]!;
}
