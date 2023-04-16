import prisma from "../../../utils/prisma";
import { RegisterProfileInput, UpdateProfileInput } from "./profile.schema";

export async function registerProfile(input: RegisterProfileInput) {
  const { email, id, supabaseId, name, defaultUnit } = input;

  const profile = await prisma.profile.create({
    data: {
      defaultUnit,
      email,
      id,
      supabaseId,
      name,
    },
  });

  return profile;
}

export async function findProfileByEmail(email: string) {
  const profile = await prisma.profile.findUnique({
    where: {
      email,
    },
  });

  return profile;
}

export async function upsertProfile(input: UpdateProfileInput) {
  const profile = await prisma.profile.upsert({
    where: {
      id: input.id,
    },
    update: {
      ...input,
    },
    create: {
      ...input,
    },
  });

  return profile;
}
