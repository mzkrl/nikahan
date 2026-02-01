import { NextRequest, NextResponse } from "next/server";
import { db, guests } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { attendanceStatus, wishes } = body;

        const updateData: Record<string, unknown> = {};
        if (attendanceStatus !== undefined) updateData.attendanceStatus = attendanceStatus;
        if (wishes !== undefined) updateData.wishes = wishes;

        const [updated] = await db
            .update(guests)
            .set(updateData as any)
            .where(eq(guests.id, parseInt(id)))
            .returning();

        if (!updated) {
            return NextResponse.json({ message: "Guest not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating guest:", error);
        return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
}
