import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
  supabase_user_id: z.string(),
  default_weight_unit: z.string(),
  gender: z.string().nullable(),
  dob_at: z.number().nullable(),
  height: z.number().nullable(),
  height_unit: z.string().nullable(),
  target_weight: z.number().nullable(),
  target_weight_unit: z.string().nullable(),
  activity_level: z.string().nullable(),
  calorie_surplus: z.number().nullable(),
});

export const profileWatermelonSchema = profileSchema.merge(
  z.object({
    _status: z.string(),
    _changed: z.string(),
  })
);

const registerProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  supabaseId: z.string(),
  id: z.string(),
  defaultUnit: z.string(),
});

const loginProfileSchema = z.object({
  email: z.string(),
});

export type RegisterProfileInput = z.infer<typeof registerProfileSchema>;
export type UpdateProfileInput = z.infer<typeof profileSchema>;

export type Profile = z.infer<typeof profileSchema>;

export const { schemas: profileSchemas, $ref } = buildJsonSchemas({
  profileSchema,
  profileWatermelonSchema,
  registerProfileSchema,
  loginProfileSchema,
});
