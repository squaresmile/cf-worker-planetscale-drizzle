import { error } from "itty-router";

import { Env } from "./env";
import apiRouter, { corsify } from "./router";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return apiRouter.handle(request, env, ctx).then(corsify).catch(error);
  },
};
