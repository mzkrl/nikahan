import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Schema
export const guests = pgTable("guests", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortlink: text("shortlink"),
    phone: text("phone"),
    attendanceStatus: text("attendance_status").default("pending"),
    wishes: text("wishes"),
    createdAt: timestamp("created_at").defaultNow(),
});

export type Guest = typeof guests.$inferSelect;

// Database connection
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
});

export const db = drizzle(pool);
