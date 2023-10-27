export interface Env {
  DB_URL: string;
}

export type CF = [env: Env, context: ExecutionContext];
