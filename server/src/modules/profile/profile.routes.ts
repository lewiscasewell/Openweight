import { FastifyInstance } from "fastify";
import {
  deleteProfileHandler,
  fetchProfileHandler,
} from "./profile.controller";
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
  server.delete(
    "/:id",
    {
      preValidation: [server.authenticate],
    },
    deleteProfileHandler
  );
}

export default profileRoutes;
