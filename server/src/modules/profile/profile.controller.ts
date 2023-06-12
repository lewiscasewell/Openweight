import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/database";
import { v4 as uuidV4 } from "uuid";
import dayjs from "dayjs";

type DeleteProfileFastifyRequest = FastifyRequest<{
  Params: {
    id: string;
  };
}>;

export async function fetchProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { user } = request;

  const profile = await db
    .selectFrom("profiles")
    .selectAll()
    .where("supabase_user_id", "=", user.id)
    .executeTakeFirst();

  // TODO: while loop that checks if a profile exists with randomId, if it does, create a new randomId
  let randomId = Math.floor(Math.random() * 1000000000);

  if (!profile) {
    // random number to create a random username
    const newProfile = {
      supabase_user_id: user.id,
      created_at: new Date(),
      updated_at: new Date(),
      name: `user${randomId}`,
      id: uuidV4(),
      calorie_surplus: 0,
      dob_at: null,
      gender: null,
      height: null,
      height_unit: "cm",
      target_weight: null,
      target_weight_unit: "kg",
      default_weight_unit: "kg",
      activity_level: null,
    };

    await db.insertInto("profiles").values(newProfile).execute();

    return reply.code(201).send({ profile: newProfile });
  }

  return reply.code(201).send({
    profile: {
      ...profile,
      dob_at: dayjs(profile.dob_at).valueOf(),
      created_at: dayjs(profile.created_at).valueOf(),
      updated_at: dayjs(profile.updated_at).valueOf(),
    },
  });
}

export async function deleteProfileHandler(
  request: DeleteProfileFastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params;

  const profile = await db
    .selectFrom("profiles")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!profile) {
    return reply.code(404).send({ message: "Profile not found" });
  }

  try {
    const { data, error } = await request.supabaseClient.auth.admin.deleteUser(
      profile.supabase_user_id
    );

    if (error) {
      console.log(error);
      return reply.code(500).send({ message: "Server error" });
    }

    console.log(data);

    await db.deleteFrom("profiles").where("id", "=", id).execute();
    await db.deleteFrom("weights").where("profile_id", "=", id).execute();

    return reply.code(200).send({ message: "Profile deleted" });
  } catch (error) {
    console.log(error);
    return reply.code(500).send({ message: "Server error" });
  }
}
