import "dotenv/config";
import type { Config } from "drizzle-kit";

const connectionString = process.env.DB_URL;

if (connectionString === undefined) throw "No connection string found";

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  out: "./src/db/migrations",
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
