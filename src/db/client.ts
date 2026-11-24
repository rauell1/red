import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const clients = new Map<string, ReturnType<typeof drizzle<typeof schema>>>();

export function createDb(databaseUrl: string) {
  const existing = clients.get(databaseUrl);
  if (existing) return existing;
  const database = drizzle(neon(databaseUrl), { schema });
  clients.set(databaseUrl, database);
  return database;
}
