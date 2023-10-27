import {
  bigint,
  int,
  json,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { z } from "zod";

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }).notNull(),
  },
  (users) => ({
    nameIndex: uniqueIndex("name_idx").on(users.name),
  }),
);

export const TeamDetailZod = z.object({
  servant1: z.string(),
  servant2: z.string(),
});

export type TeamDetail = z.infer<typeof TeamDetailZod>;

export const teams = mysqlTable("teams", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 1000 }).notNull(),
  teamDetail: json("team_detail")
    .$type<TeamDetail>() /* $type to get type inference later on */
    .notNull(),
  likes: int("likes").notNull(),
});
