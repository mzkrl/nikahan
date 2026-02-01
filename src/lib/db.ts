import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ============ SCHEMA ============
export const guests = pgTable("guests", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortlink: text("shortlink"),
    phone: text("phone"),
    attendanceStatus: text("attendance_status").default("pending"), // pending, present, absent
    wishes: text("wishes"),
    createdAt: timestamp("created_at").defaultNow(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

// ============ DATABASE CONNECTION ============
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.warn("POSTGRES_URL not set, database operations will fail");
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 30000,
});

export const db = drizzle(pool);

// Helper to generate slug from name
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}
