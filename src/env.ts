export interface Env {
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
}

export type CF = [env: Env, context: ExecutionContext];
