import { FastifyReply, FastifyRequest } from "fastify";
import { RegisterProfileInput, UpdateProfileInput } from "./profile.schema";
import {
  findProfileByEmail,
  registerProfile,
  upsertProfile,
} from "./profile.service";

export async function createProfileHandler(
  request: FastifyRequest<{ Body: RegisterProfileInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const profile = await registerProfile(body);

    return reply.code(201).send(profile);
  } catch (error) {
    reply.code(500).send(error);
  }
}

export async function getProfileHandler(
  request: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) {
  try {
    const profile = await findProfileByEmail(request.body.email);
    return reply.code(200).send(profile);
  } catch (error) {
    return reply.code(500).send(error);
  }
}

export async function updateProfileHandler(
  request: FastifyRequest<{ Body: UpdateProfileInput }>,
  reply: FastifyReply
) {
  try {
    const body = request.body;
    const profile = await upsertProfile(body);

    return reply.code(200).send(profile);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
