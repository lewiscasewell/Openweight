import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import syncRoutes from "./modules/sync/sync.routes";
import { syncSchemas } from "./modules/sync/sync.schema";
import { User } from "@supabase/supabase-js";
import { client } from "./plugins/supabase";

declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}
async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.headers.authorization) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const token = request.headers.authorization.split(" ")[1];
    const { data, error } = await client.auth.getUser(token);

    if (error) throw new Error(error.message);

    request.user = data.user;
  } catch (error) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }
}

function buildServer() {
  const server = Fastify({ logger: true });

  server.get(
    "/health",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: "ok" };
    }
  );

  server.decorate("authenticate", authMiddleware);

  for (const schema of [...syncSchemas]) {
    server.addSchema(schema);
  }

  server.register(syncRoutes, { prefix: "api/sync" });

  return server;
}

export default buildServer;
