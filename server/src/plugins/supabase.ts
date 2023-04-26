import { createClient } from "@supabase/supabase-js";
import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>;
  }
}

const supabasePlugin: FastifyPluginAsync = async (fastify, options) => {
  const supabaseUrl = fastify.config.SUPABASE_URL;
  const supabaseKey = fastify.config.SUPABASE_KEY;

  fastify.decorate("supabase", createClient(supabaseUrl, supabaseKey, {}));
};

export default fastifyPlugin(supabasePlugin);
