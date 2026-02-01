import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, guests } from "@/lib/db";
import { eq } from "drizzle-orm";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

async function checkAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return session?.value === "authenticated";
}

export async function GET() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const allGuests = await db.select().from(guests);
        return NextResponse.json(allGuests);
    } catch (error) {
        console.error("Error fetching guests:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, phone } = await request.json();
        const slug = generateSlug(name);

        const [guest] = await db.insert(guests).values({
            name,
            slug,
            phone: phone || null,
        } as any).returning();

        return NextResponse.json(guest, { status: 201 });
    } catch (error) {
        console.error("Error creating guest:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}
