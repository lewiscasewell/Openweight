import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { pullChangesHandler, pushChangesHandler } from "./sync.controller";
import { $ref } from "./sync.schema";

async function syncRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preValidation: [server.authenticate],
      schema: {
        querystring: {
          type: "object",
          properties: {
            last_pulled_at: { type: "string" },
          },
        },
        response: {
          200: $ref("pullChangesSchema"),
        },
      },
    },
    pullChangesHandler
  );

  server.post(
    "/",
    {
      //   schema: {
      //     querystring: {
      //       type: "object",
      //       properties: {
      //         last_pulled_at: { type: "string" },
      //       },
      //     },
      //     body: $ref("pushChangesSchema"),
      //   },
    },
    pushChangesHandler
  );
}

export default syncRoutes;
