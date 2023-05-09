import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PullChangeResponse, PushChangeRequestBody } from "./sync.schema";
import { weightSchema } from "../weight/weight.schema";
import { z } from "zod";
import { profileSchema } from "../profile/profile.schema";
import { db } from "../../db/database";
import { sql } from "kysely";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Profiles } from "../../db/database";
dayjs.extend(utc);

type PullChangesSyncFastifyRequest = FastifyRequest<{
  Querystring: {
    last_pulled_at: string;
  };
}>;

type PushChangesSyncFastifyRequest = FastifyRequest<{
  Querystring: {
    last_pulled_at: string;
  };
  Body: PushChangeRequestBody;
}>;

const getSafeLastPulledAt = (
  request: PullChangesSyncFastifyRequest | PushChangesSyncFastifyRequest
) => {
  const lastPulledAt = request.query.last_pulled_at;

  if (!lastPulledAt || lastPulledAt === "null") {
    return new Date(0);
  }

  console.log("lastPulledAt in date", new Date(parseInt(lastPulledAt)));
  return new Date(parseInt(lastPulledAt));
};

export async function pullChangesHandler(
  request: PullChangesSyncFastifyRequest,
  reply: FastifyReply
) {
  // @ts-ignore
  const client = (this as FastifyInstance).supabase;
  const lastPulledAt = getSafeLastPulledAt(request);

  console.log("lastpulledat utc string", lastPulledAt.toUTCString());
  console.log("request.user.id", request.user.id);
  console.log("request.query.last_pulled_at", request.query.last_pulled_at);

  // Profiles

  const createdProfiles = await db
    .selectFrom("profiles")
    .selectAll()
    .where("supabase_user_id", "=", request.user.id)
    .where("created_at", ">", lastPulledAt)
    .execute();

  const updatedProfiles = await db
    .selectFrom("profiles")
    .selectAll()
    .where("supabase_user_id", "=", request.user.id)
    .where("updated_at", ">", lastPulledAt)
    .execute();

  // const { data: updatedSupabaseProfiles } = await client
  //   .from("Profile")
  //   .select()
  //   .gt("updatedAt", lastPulledAt.toUTCString())
  //   .lte("createdAt", lastPulledAt.toUTCString())
  //   .eq("supabaseId", request.user.id);

  // const { data: createdSupabaseProfiles } = await client
  //   .from("Profile")
  //   .select()
  //   .gt("createdAt", lastPulledAt.toUTCString())
  //   .eq("supabaseId", request.user.id);

  // const updatedProfiles = z.array(profileSchema).parse(updatedSupabaseProfiles);
  // const createdProfiles = z.array(profileSchema).parse(createdSupabaseProfiles);

  // Weights

  const createdWeights = await db
    .selectFrom("weights")
    .selectAll()
    .where("supabase_user_id", "=", request.user.id)
    .where("created_at", ">", lastPulledAt)
    .execute();

  const updatedWeights = await db
    .selectFrom("weights")
    .selectAll()
    .where("supabase_user_id", "=", request.user.id)
    .where("updated_at", ">", lastPulledAt)
    .where("created_at", "<=", lastPulledAt)
    .execute();

  console.log("createdWeights", createdWeights);
  console.log("updatedWeights", updatedWeights);

  // const kyselyWeights = await db
  //   .selectFrom("weights")
  //   .selectAll()
  //   // .where("Weight.supabase_user_id", "=", request.user.id)
  //   .where(sql`"updated_at" > ${lastPulledAt}`)
  //   .execute();

  // console.log(
  //   "kysely",
  //   kyselyWeights.map((w) => ({
  //     weight: w.weight,
  //     lastPulledAt,
  //     updatedAt: w.updated_at,
  //     compare: w.updated_at > lastPulledAt,
  //   }))
  // );

  // const { data: updatedSupabaseWeights } = await client
  //   .from("Weight")
  //   .select()
  //   .gt("updatedAt", lastPulledAt.toUTCString())
  //   .lte("createdAt", lastPulledAt.toUTCString())
  //   .eq("supabaseId", request.user.id);

  // const { data: createdSupabaseWeights } = await client
  //   .from("Weight")
  //   .select()
  //   .gt("createdAt", lastPulledAt.toUTCString())
  //   .eq("supabaseId", request.user.id);

  // const updatedWeights = z.array(weightSchema).parse(updatedSupabaseWeights);
  // const createdWeights = z.array(weightSchema).parse(createdSupabaseWeights);

  const pullChangesResponse: PullChangeResponse = {
    changes: {
      profiles: {
        created: [],
        updated: updatedProfiles.map((p) => ({
          ...p,
          created_at: dayjs(p.created_at).valueOf(),
          updated_at: dayjs(p.updated_at).valueOf(),
          dob_at: dayjs(p.dob_at).valueOf(),
        })),
        deleted: [],
      },
      weights: {
        created: createdWeights.map((w) => ({
          ...w,
          created_at: dayjs(w.created_at).valueOf(),
          updated_at: dayjs(w.updated_at).valueOf(),
          date_at: dayjs(w.date_at).valueOf(),
        })),
        updated: updatedWeights.map((w) => ({
          ...w,
          created_at: dayjs(w.created_at).valueOf(),
          updated_at: dayjs(w.updated_at).valueOf(),
          date_at: dayjs(w.date_at).valueOf(),
        })),
        deleted: [],
      },
    },
    timestamp: new Date().getTime(),
  };

  console.log(
    "pull changes response",
    pullChangesResponse.changes.profiles.updated
  );

  return reply.code(200).send(pullChangesResponse);
}

export async function pushChangesHandler(
  request: PushChangesSyncFastifyRequest,
  reply: FastifyReply
) {
  const changes = request.body;
  const client = request.supabaseClient;
  if (!changes) {
    return reply.code(400).send({
      status:
        "No changes included in body, or it is the wrong shape in the body",
    });
  }

  const lastPulledAt = getSafeLastPulledAt(request);
  console.log(lastPulledAt, request.query.last_pulled_at);
  console.log("changes", changes.profiles.created?.[0]);
  console.log(changes.weights.updated?.[0]);

  if (changes.profiles.created.length > 0) {
    const createdProfileData = changes.profiles.created.map((profile) => ({
      id: profile.id,
      name: profile.name,
      activity_level: profile.activity_level,
      calorie_surplus: profile.calorie_surplus,
      created_at: dayjs(profile.created_at).toDate(),
      default_weight_unit: profile.default_weight_unit,
      dob_at: profile.dob_at && dayjs(profile.dob_at).toDate(),
      gender: profile.gender,
      height: profile.height,
      height_unit: profile.height_unit,
      supabase_user_id: profile.supabase_user_id,
      target_weight: profile.target_weight,
      target_weight_unit: profile.target_weight_unit,
      updated_at: dayjs(profile.updated_at).toDate(),
    }));
    await db.insertInto("profiles").values(createdProfileData).execute();
  }

  if (changes.profiles.updated.length > 0) {
    const updatedDataPromises = changes.profiles.updated.map(
      async (profile) => {
        return db
          .updateTable("profiles")
          .set({
            name: profile.name,
            activity_level: profile.activity_level,
            calorie_surplus: profile.calorie_surplus,
            created_at: profile.created_at,
            default_weight_unit: profile.default_weight_unit,
            dob_at: profile.dob_at,
            gender: profile.gender,
            height: profile.height,
            height_unit: profile.height_unit,
            supabase_user_id: profile.supabase_user_id,
            target_weight: profile.target_weight,
            target_weight_unit: profile.target_weight_unit,
            updated_at: profile.updated_at,
          })
          .where("id", "=", profile.id)
          .execute();
      }
    );

    await Promise.all(updatedDataPromises);
  }

  if (changes.weights.created.length > 0) {
    const createdWeightData = changes.weights.created.map((weight) => ({
      id: weight.id,
      created_at: dayjs(weight.created_at).toDate(),
      updated_at: dayjs(weight.updated_at).toDate(),
      supabase_user_id: weight.supabase_user_id,
      weight: weight.weight,
      unit: weight.unit,
      date_at: dayjs(weight.date_at).toDate(),
      profile_id: weight.profile_id,
    }));

    await db.insertInto("weights").values(createdWeightData).execute();
  }

  if (changes.weights.updated.length > 0) {
    const updatedDataPromises = changes.weights.updated.map(async (weight) => {
      return db
        .updateTable("weights")
        .set({
          id: weight.id,
          created_at: dayjs(weight.created_at).toDate(),
          updated_at: dayjs(weight.updated_at).toDate(),
          supabase_user_id: weight.supabase_user_id,
          weight: weight.weight,
          unit: weight.unit,
          date_at: dayjs(weight.date_at).toDate(),
          profile_id: weight.profile_id,
        })
        .where("id", "=", weight.id)
        .execute();
    });
    (await Promise.all(updatedDataPromises)).map((weight) => {
      console.log("updated weight", weight);
    });
  }

  return reply.code(200).send({ status: "ok" });
}
