import { NextRequest, NextResponse } from "next/server";
import { db, guests } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const [guest] = await db.select().from(guests).where(eq(guests.slug, slug));

        if (!guest) {
            return NextResponse.json({ message: "Guest not found" }, { status: 404 });
        }

        return NextResponse.json(guest);
    } catch (error) {
        console.error("Error fetching guest:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}
