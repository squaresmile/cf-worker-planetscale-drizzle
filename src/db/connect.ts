import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { Env } from "../env";

export const getDb = (env: Env) => {
  const config = {
    host: env.DATABASE_HOST,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    //  @ts-ignore
    fetch: (url, init) => {
      delete init["cache"];
      return fetch(url, init);
    },
  };
  return drizzle(connect(config));
};
