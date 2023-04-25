import fastifyEnv from "@fastify/env";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
    };
  }
}

const options = {
  confKey: "config",
  dotenv: {
    path: `.env`,
    debug: true,
  },
  data: process.env,
  schema: {
    type: "object",
    required: ["SUPABASE_URL", "SUPABASE_KEY"],
    properties: {
      SUPABASE_URL: {
        type: "string",
      },
      SUPABASE_KEY: {
        type: "string",
      },
    },
  },
};

const envPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyEnv, options);
};

export default fastifyPlugin(envPlugin);
