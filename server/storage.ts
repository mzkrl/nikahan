import { db } from "./db";
import { guests, type Guest, type InsertGuest } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getGuests(): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  getGuestBySlug(slug: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, updates: Partial<Guest>): Promise<Guest>;
  deleteGuest(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests);
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async getGuestBySlug(slug: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.slug, slug));
    return guest;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db.insert(guests).values(insertGuest).returning();
    return guest;
  }

  async updateGuest(id: number, updates: Partial<Guest>): Promise<Guest> {
    const [updated] = await db
      .update(guests)
      .set(updates)
      .where(eq(guests.id, id))
      .returning();
    return updated;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
