import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  supabaseId: z.string(),
  defaultUnit: z.string(),
  gender: z.string().nullable(),
  dob: z.date().nullable(),
  height: z.number().nullable(),
  heightUnit: z.string().nullable(),
  targetWeight: z.number().nullable(),
  targetWeightUnit: z.string().nullable(),
  activityLevel: z.string().nullable(),
  calorieSurplus: z.number().nullable(),
});

export const profileWatermelonSchema = z.object({
  _status: z.string(),
  _changed: z.string(),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  supabase_id: z.string(),
  default_unit: z.string(),
  gender: z.string().nullable(),
  dob: z.date().nullable(),
  height: z.number().nullable(),
  height_unit: z.string().nullable(),
  target_weight: z.number().nullable(),
  target_weight_unit: z.string().nullable(),
  activity_level: z.string().nullable(),
  calorie_surplus: z.number().nullable(),
});

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

export const { schemas: profileSchemas, $ref } = buildJsonSchemas({
  profileSchema,
  profileWatermelonSchema,
  registerProfileSchema,
  loginProfileSchema,
});
