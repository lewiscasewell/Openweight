import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import {
  profileSchema,
  profileWatermelonSchema,
} from "../profile/profile.schema";
import { weightSchema } from "../weight/weight.schema";

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
      created: z.array(profileSchema),
      updated: z.array(profileSchema),
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
    created: z.array(weightSchema),
    updated: z.array(weightSchema),
    deleted: z.array(
      z.object({
        id: z.string(),
      })
    ),
  }),
  profiles: z.object({
    created: z.array(profileWatermelonSchema),
    updated: z.array(profileWatermelonSchema),
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
