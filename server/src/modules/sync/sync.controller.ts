import { FastifyReply, FastifyRequest } from "fastify";
import { client } from "../../plugins/supabase";
import { PullChangeResponse, PushChangeRequestBody } from "./sync.schema";
import { weightSchema } from "../weight/weight.schema";
import { z } from "zod";
import { profileSchema } from "../profile/profile.schema";

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
  return new Date(parseInt(lastPulledAt, 10));
};

export async function pullChangesHandler(
  request: PullChangesSyncFastifyRequest,
  reply: FastifyReply
) {
  const lastPulledAt = getSafeLastPulledAt(request);
  console.log(lastPulledAt, request.query.last_pulled_at);
  console.log("request.user.id", request.user.id);

  const { data: updatedSupabaseProfiles } = await client
    .from("Profile")
    .select()
    .gt("updatedAt", lastPulledAt.toUTCString())
    .lte("createdAt", lastPulledAt.toUTCString())
    .eq("supabaseId", request.user.id);
  const { data: createdSupabaseProfiles } = await client
    .from("Profile")
    .select()
    .gt("createdAt", lastPulledAt.toUTCString())
    .eq("supabaseId", request.user.id);

  const updatedProfiles = z.array(profileSchema).parse(updatedSupabaseProfiles);
  const createdProfiles = z.array(profileSchema).parse(createdSupabaseProfiles);

  const { data: updatedSupabaseWeights } = await client
    .from("Weight")
    .select()
    .gt("updatedAt", lastPulledAt.toUTCString())
    .lte("createdAt", lastPulledAt.toUTCString())
    .eq("supabaseId", request.user.id);

  const { data: createdSupabaseWeights } = await client
    .from("Weight")
    .select()
    .gt("createdAt", lastPulledAt.toUTCString())
    .eq("supabaseId", request.user.id);

  const updatedWeights = z.array(weightSchema).parse(updatedSupabaseWeights);
  const createdWeights = z.array(weightSchema).parse(createdSupabaseWeights);

  const pullChangesResponse: PullChangeResponse = {
    changes: {
      profiles: {
        created: createdProfiles,
        updated: updatedProfiles,
        deleted: [],
      },
      weights: {
        created: createdWeights,
        updated: updatedWeights,
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

  if (!changes) {
    return reply.code(400).send({
      status:
        "No changes included in body, or it is the wrong shape in the body",
    });
  }

  const lastPulledAt = getSafeLastPulledAt(request);
  console.log(lastPulledAt, request.query.last_pulled_at);
  console.log("changes", changes);

  if (changes.profiles.created.length > 0) {
    const createdProfileData = changes.profiles.created.map((profile) => ({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
      supabaseId: profile.supabase_id,
      defaultUnit: profile.default_unit,
    }));
    await client.from("Profile").insert(createdProfileData);
  }

  if (changes.profiles.updated.length > 0) {
    const updatedDataPromises = changes.profiles.updated.map(
      async (profile) => {
        return client
          .from("Profile")
          .update({
            email: profile.email,
            name: profile.name,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
            supabaseId: profile.supabase_id,
            defaultUnit: profile.default_unit,
            gender: profile.gender,
            height: profile.height,
            activityLevel: profile.activity_level,
            calorieSurplus: profile.calorie_surplus,
            dob: profile.dob,
            heightUnit: profile.height_unit,
            targetWeight: profile.target_weight,
            targetWeightUnit: profile.target_weight_unit,
          })
          .eq("id", profile.id)
          .single();
      }
    );
    await Promise.all(updatedDataPromises);
  }

  if (changes.weights.created.length > 0) {
    const createdWeightData = changes.weights.created.map((weight) => ({
      id: weight.id,
      createdAt: new Date(weight.created_at),
      updatedAt: new Date(weight.updated_at),
      supabaseId: weight.supabase_id,
      weight: weight.weight,
      unit: weight.unit,
      date: new Date(weight.date),
      profileId: weight.profile_id,
      dateString: weight.date_string,
    }));
    await client.from("Weight").insert(createdWeightData);
  }

  if (changes.weights.updated.length > 0) {
    const updatedDataPromises = changes.weights.updated.map(async (weight) => {
      console.log("weight to update", weight);
      return client
        .from("Weight")
        .update({
          dateString: weight.date_string,
          createdAt: new Date(weight.created_at).toUTCString(),
          updatedAt: new Date(weight.updated_at).toUTCString(),
          supabaseId: weight.supabase_id,
          weight: weight.weight,
          unit: weight.unit,
          date: new Date(weight.date).toUTCString(),
          profileId: weight.profile_id,
        })
        .eq("id", weight.id)
        .single();
    });
    (await Promise.all(updatedDataPromises)).map((weight) => {
      console.log("updated weight", weight);
    });
  }

  return reply.code(200).send({ status: "ok" });
}
