import { NextRequest, NextResponse } from "next/server";
import { db, guests } from "@/lib/db";

export async function GET() {
    try {
        const allGuests = await db.select().from(guests);
        return NextResponse.json(allGuests);
    } catch (error) {
        console.error("Error fetching guests:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}
