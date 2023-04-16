import { createClient } from "@supabase/supabase-js";
import { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
// if (!supabaseUrl || !supabaseKey) {
//   throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be provided");
// }

export const client = createClient(supabaseUrl, supabaseKey, {});
// const supabasePlugin: FastifyPluginCallback = (fastify, opts, done) => {

//   fastify.decorate("supabase", client);
//   done();
// };

// export default fp(supabasePlugin, { name: "supabase" });
