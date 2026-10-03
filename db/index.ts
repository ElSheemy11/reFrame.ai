import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const db_url = process.env.DATABASE_URL;
if (!db_url) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(db_url);

export const db = drizzle(sql, { schema });