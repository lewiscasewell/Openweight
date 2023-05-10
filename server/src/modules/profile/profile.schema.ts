import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

export const profileBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  supabase_user_id: z.string(),
  default_weight_unit: z.string(),
  gender: z.string().nullable(),
  height: z.number().nullable(),
  height_unit: z.string().nullable(),
  target_weight: z.number().nullable(),
  target_weight_unit: z.string().nullable(),
  activity_level: z.string().nullable(),
  calorie_surplus: z.number().nullable(),
});

export const profilePushChangesSchema = profileBaseSchema.merge(
  z.object({
    _status: z.string(),
    _changed: z.string(),
    created_at: z.number(),
    updated_at: z.number(),
    dob_at: z.number().nullable(),
  })
);

export const profilePullChangesSchema = profileBaseSchema.merge(
  z.object({
    created_at: z.number(),
    updated_at: z.number(),
    dob_at: z.number().nullable(),
  })
);

export const { schemas: profileSchemas, $ref } = buildJsonSchemas({
  profileBaseSchema,
  profilePushChangesSchema,
  profilePullChangesSchema,
});
