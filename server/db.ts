import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../shared/schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres("postgresql://postgres:BoJEW5JvYMlPIdQy@localhost:5432/secret");

export const db = drizzle(conn, { schema });
