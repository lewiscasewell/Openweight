import Fastify, { FastifyReply, FastifyRequest } from "fastify";

function buildServer() {
  const server = Fastify();

  server.get(
    "/health",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: "ok" };
    }
  );

  return server;
}

export default buildServer;
