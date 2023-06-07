import { createClient } from "@supabase/supabase-js";
import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { config } from "../config";

declare module "fastify" {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>;
  }
}

const supabasePlugin: FastifyPluginAsync = async (fastify, options) => {
  const { supabaseUrl, supabaseKey } = config.supabase;

  fastify.decorate("supabase", createClient(supabaseUrl, supabaseKey, {}));
};

export default fastifyPlugin(supabasePlugin);
