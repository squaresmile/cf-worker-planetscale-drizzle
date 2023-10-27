import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { Env } from "../env";

export const getDb = (env: Env) => {
  const config = {
    url: env.DB_URL,
  };
  return drizzle(connect(config));
};
