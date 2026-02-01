import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, guests } from "@/lib/db";
import { eq } from "drizzle-orm";

async function checkAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return session?.value === "authenticated";
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await db.delete(guests).where(eq(guests.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting guest:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}
