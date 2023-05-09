import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { fetchProfileHandler } from "./profile.controller";
// import { $ref } from "./sync.schema";

async function profileRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      preValidation: [server.authenticate],
      // schema: {
      //   querystring: {
      //     type: "object",
      //     properties: {
      //       last_pulled_at: { type: "string" },
      //     },
      //   },
      //   body: $ref("pushChangesSchema"),
      // },
    },
    fetchProfileHandler
  );
}

export default profileRoutes;
