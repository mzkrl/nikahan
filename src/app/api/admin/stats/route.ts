import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, guests } from "@/lib/db";

export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (session?.value !== "authenticated") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const allGuests = await db.select().from(guests);

        return NextResponse.json({
            total: allGuests.length,
            attending: allGuests.filter((g) => g.attendanceStatus === "present").length,
            notAttending: allGuests.filter((g) => g.attendanceStatus === "absent").length,
            pending: allGuests.filter((g) => g.attendanceStatus === "pending").length,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}
