import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import syncRoutes from "./modules/sync/sync.routes";
import { syncSchemas } from "./modules/sync/sync.schema";
import { SupabaseClient, User } from "@supabase/supabase-js";
// import { client } from "./plugins/supabase";
import envPlugin from "./plugins/env";
import supabasePlugin from "./plugins/supabase";

declare module "fastify" {
  interface FastifyRequest {
    user: User;
    supabaseClient: SupabaseClient;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

const buildServer = () => {
  const server = Fastify({ logger: true });

  server.get(
    "/health",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: "ok" };
    }
  );

  server.register(envPlugin).after(() => {
    server.register(supabasePlugin).after(() => {
      server.addHook("onRequest", async (request, reply) => {
        request.supabaseClient = server.supabase;
      });

      server.decorate(
        "authenticate",
        async (request: FastifyRequest, reply: FastifyReply) => {
          if (!request.headers.authorization) {
            reply.status(401).send({ error: "Unauthorized" });
            return;
          }

          const token = request.headers.authorization.split(" ")[1];
          const { data, error } = await server.supabase.auth.getUser(token);

          console.log("data", data);

          if (error) throw new Error(error.message);

          request.user = data.user;

          return;
        }
      );

      for (const schema of [...syncSchemas]) {
        server.addSchema(schema);
      }

      server.register(syncRoutes, { prefix: "api/sync" });
    });
  });

  return server;
};

export default buildServer;
