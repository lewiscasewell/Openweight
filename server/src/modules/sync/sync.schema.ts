import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import {
  profilePullChangesSchema,
  profilePushChangesSchema,
} from "../profile/profile.schema";
import { weightSchema, weightWatermelonSchema } from "../weight/weight.schema";

export const pullChangesSchema = z.object({
  timestamp: z.number(),
  changes: z.object({
    weights: z.object({
      created: z.array(weightSchema),
      updated: z.array(weightSchema),
      deleted: z.array(
        z.object({
          id: z.string(),
        })
      ),
    }),
    profiles: z.object({
      created: z.array(profilePullChangesSchema),
      updated: z.array(profilePullChangesSchema),
      deleted: z.array(
        z.object({
          id: z.string(),
        })
      ),
    }),
  }),
});

export const pushChangesSchema = z.object({
  weights: z.object({
    created: z.array(weightWatermelonSchema),
    updated: z.array(weightWatermelonSchema),
    deleted: z.array(
      z.object({
        id: z.string(),
      })
    ),
  }),
  profiles: z.object({
    created: z.array(profilePushChangesSchema),
    updated: z.array(profilePushChangesSchema),
    deleted: z.array(
      z.object({
        id: z.string(),
      })
    ),
  }),
});

export type PullChangeResponse = z.infer<typeof pullChangesSchema>;
export type PushChangeRequestBody = z.infer<typeof pushChangesSchema>;

export const { schemas: syncSchemas, $ref } = buildJsonSchemas({
  pullChangesSchema,
  pushChangesSchema,
});
