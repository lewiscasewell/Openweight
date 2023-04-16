import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../../utils/prisma";

import { PullChangeResponse, PushChangeRequestBody } from "./sync.schema";

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
  return new Date(parseInt(lastPulledAt));
};

export async function pullChangesHandler(
  request: PullChangesSyncFastifyRequest,
  reply: FastifyReply
) {
  const lastPulledAt = getSafeLastPulledAt(request);
  console.log(lastPulledAt, request.query.last_pulled_at);

  const createdProfiles = await prisma.profile.findMany({
    where: {
      AND: [
        {
          createdAt: {
            gt: lastPulledAt,
          },
        },
        {
          supabaseId: request.user.id,
        },
      ],
    },
  });

  const updatedProfiles = await prisma.profile.findMany({
    where: {
      AND: [
        {
          updatedAt: {
            gt: lastPulledAt,
          },
        },
        {
          createdAt: {
            lte: lastPulledAt,
          },
        },
        {
          supabaseId: request.user.id,
        },
      ],
    },
  });

  const pullChangesResponse: PullChangeResponse = {
    changes: {
      profiles: {
        created: createdProfiles,
        updated: updatedProfiles,
        deleted: [],
      },
      weights: {
        created: [],
        updated: [],
        deleted: [],
      },
    },
    timestamp: new Date().getTime(),
  };

  console.log("pull changes response", pullChangesResponse);

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
  console.log("changes", changes.profiles);

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
    await prisma.profile.createMany({
      data: createdProfileData,
    });
  }

  if (changes.profiles.updated.length > 0) {
    const updatedDataPromises = changes.profiles.updated.map(
      async (profile) => {
        return prisma.profile.update({
          where: {
            id: profile.id,
          },
          data: {
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
          },
        });
      }
    );
    await Promise.all(updatedDataPromises);
  }

  return reply.code(200).send({ status: "ok" });
}
