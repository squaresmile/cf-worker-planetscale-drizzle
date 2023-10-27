import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import {
  IRequest,
  Router,
  StatusError,
  createCors,
  error,
  json,
} from "itty-router";
import { z } from "zod";

import { getDb } from "./db/connect";
import { TeamDetail, TeamDetailZod, teams, users } from "./db/schema";
import { CF } from "./env";

export const { preflight, corsify } = createCors({
  origins: ["*"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

const errorResponse = (zodError: z.ZodError) =>
  error(400, {
    message: `Failed to parse body: ${zodError.issues
      .map((i) => i.message)
      .join(", ")}`,
  });

const router = Router({ base: "/api/v1" }).all("*", preflight);

router.get<IRequest, CF>("/user/:id", async ({ params }, env) => {
  const db = getDb(env);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(params.id)))
    .limit(1);

  if (user.length === 0) {
    return error(404, { message: "User not found" });
  } else {
    return json({ ...user[0] });
  }
});

const insertUsersSchema = createInsertSchema(users);

router.post<IRequest, CF>("/user/new", async (request, env) => {
  const zodParseResult = insertUsersSchema.safeParse(await request.json());
  if (!zodParseResult.success) return errorResponse(zodParseResult.error);

  await getDb(env).insert(users).values({
    name: zodParseResult.data.name,
  });

  return json({ message: "success" });
});

router.get<IRequest, CF>("/team/:id", async ({ params }, env) => {
  const db = getDb(env);
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, parseInt(params.id)))
    .limit(1);

  if (team.length === 0) {
    return error(404, { message: "Team not found" });
  } else {
    return json({ ...team[0] });
  }
});

const insertTeamsSchema = createInsertSchema(teams, {
  likes: (schema) => schema.id.optional(),
});

router.post<IRequest, CF>("/team/new", async (request, env) => {
  const zodParseResult = insertTeamsSchema.safeParse(await request.json());
  if (!zodParseResult.success) return errorResponse(zodParseResult.error);

  const inputData = zodParseResult.data;
  await getDb(env)
    .insert(teams)
    .values({
      name: inputData.name,
      userId: inputData.userId,
      teamDetail: inputData.teamDetail as unknown as TeamDetail, // drizzle-zod doesn't have good type inference here
      likes: inputData.likes ?? 0,
    });

  return json({ message: "success" });
});

const putTeamsSchema = z.object({
  teamDetail: TeamDetailZod,
});

router.put<IRequest, CF>("/team/:id", async (request, env) => {
  const zodParseResult = putTeamsSchema.safeParse(await request.json());
  if (!zodParseResult.success) return errorResponse(zodParseResult.error);

  await getDb(env)
    .update(teams)
    .set({
      teamDetail: zodParseResult.data.teamDetail,
    })
    .where(eq(teams.id, parseInt(request.params.id)));

  return json({ message: "success" });
});

const patchTeamsSchema = z.object({
  likesChange: z.number().int(),
});

router.patch<IRequest, CF>("/team/:id", async (request, env) => {
  const zodParseResult = patchTeamsSchema.safeParse(await request.json());
  if (!zodParseResult.success) return errorResponse(zodParseResult.error);

  await getDb(env).transaction(async (tx) => {
    const currentLikes = await tx
      .select({ likes: teams.likes })
      .from(teams)
      .where(eq(teams.likes, parseInt(request.params.id)))
      .limit(1);

    if (currentLikes.length === 0) {
      throw new StatusError(404, "Can't find team ID.");
    } else {
      await tx
        .update(teams)
        .set({
          likes: Math.max(
            currentLikes[0].likes + zodParseResult.data.likesChange,
            0,
          ),
        })
        .where(eq(teams.id, parseInt(request.params.id)));
    }
  });

  return json({ message: "success" });
});

router.delete<IRequest, CF>("/team/:id", async ({ params }, env) => {
  await getDb(env)
    .delete(teams)
    .where(eq(teams.id, parseInt(params.id)));

  return json({ message: "success" });
});

router.all("*", () => error(404, { message: "Route not found" }));

export default router;
