import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  shortlink: true 
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;

export const adminLoginSchema = z.object({
  password: z.string(),
});
