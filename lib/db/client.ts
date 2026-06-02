import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema> & {
  $client: NeonQueryFunction<false, false>;
};

let cached: Database | null = null;

function getDb(): Database {
  if (cached) {
    return cached;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a Neon Postgres connection string to .env.local."
    );
  }

  const sql = neon(connectionString);
  cached = drizzle(sql, { schema }) as Database;
  return cached;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  }
});

export { schema };
