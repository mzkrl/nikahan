import { NextResponse } from "next/server";
import { db, guests } from "@/lib/db";
import { isNotNull, ne, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Ambil guest yang punya wishes (tidak null dan tidak string kosong)
        const wishesData = await db
            .select({
                name: guests.name,
                wishes: guests.wishes,
                createdAt: guests.createdAt
            })
            .from(guests)
            .where(isNotNull(guests.wishes))
            .orderBy(desc(guests.createdAt))
            .limit(50); // Batasi 50 ucapan terbaru agar performa aman

        // Filter manual tambahan untuk string kosong jika operator db loloskan
        const filtered = wishesData.filter(g => g.wishes && g.wishes.trim().length > 0);

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("Failed to fetch wishes:", error);
        return NextResponse.json({ message: "Failed to fetch wishes" }, { status: 500 });
    }
}
