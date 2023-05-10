import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/database";
import { v4 as uuidV4 } from "uuid";
import dayjs from "dayjs";

export async function fetchProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { user } = request;
  console.log("user in the server", user);

  const profile = await db
    .selectFrom("profiles")
    .selectAll()
    .where("supabase_user_id", "=", user.id)
    .executeTakeFirst();

  console.log("profile in the server", profile);

  // TODO: while loop that checks if a profile exists with randomId, if it does, create a new randomId
  let randomId = Math.floor(Math.random() * 1000000000);

  if (!profile) {
    // random number to create a random username
    const newProfile = await db
      .insertInto("profiles")
      .values({
        supabase_user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
        name: `user${randomId}`,
        id: uuidV4(),
      })
      .execute();

    console.log("profile in the server after creation", newProfile);

    return reply.code(201).send(newProfile);
  }

  return reply.code(201).send({
    ...profile,
    dob_at: dayjs(profile.dob_at).valueOf(),
    created_at: dayjs(profile.created_at).valueOf(),
    updated_at: dayjs(profile.updated_at).valueOf(),
  });
}
