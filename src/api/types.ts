export interface AppBindings {
  DATABASE_URL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  [key: string]: unknown;
}

export type AppEnvironment = { Bindings: AppBindings };
