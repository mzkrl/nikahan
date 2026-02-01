import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, guests } from "@/lib/db";
import { eq } from "drizzle-orm";

async function checkAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return session?.value === "authenticated";
}

// Generate shortlink using external API or create a simple one
async function createShortlink(url: string): Promise<string | null> {
    const apiKey = process.env.SHORTLINK_API_KEY;

    // If no API key, create a simple hash-based shortlink simulation
    if (!apiKey) {
        // Just return the original URL as fallback
        return url;
    }

    try {
        // Using a free shortlink API (you can replace with your preferred service)
        const response = await fetch("https://api.tinyurl.com/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: url,
                domain: "tinyurl.com",
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.data?.tiny_url || url;
        }
    } catch (error) {
        console.error("Shortlink API error:", error);
    }

    return url;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const guestId = parseInt(id);

        // Get guest
        const [guest] = await db.select().from(guests).where(eq(guests.id, guestId));
        if (!guest) {
            return NextResponse.json({ message: "Guest not found" }, { status: 404 });
        }

        // Build the full invite URL
        const baseUrl = process.env.PUBLIC_SITE_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
        const inviteUrl = `${baseUrl}/?guest=${guest.slug}`;

        // Generate shortlink
        const shortlink = await createShortlink(inviteUrl);

        // Update guest with shortlink
        const [updated] = await db
            .update(guests)
            .set({ shortlink } as any)
            .where(eq(guests.id, guestId))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error generating shortlink:", error);
        return NextResponse.json({ message: "Failed to generate shortlink" }, { status: 500 });
    }
}
