import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  connectionTimeoutMillis: 30000, // 30 seconds
  max: 1, // Limit pool size to reduce connection overhead
  ssl: { rejectUnauthorized: false } // Fix for self-signed certificates or Neon specific SSL requirement
});
export const db = drizzle(pool, { schema });
