import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, guests } from "@/lib/db";
import { eq } from "drizzle-orm";

async function checkAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return session?.value === "authenticated";
}

// Generate shortlink using ze4.me API
async function createShortlink(url: string, preferredSlug?: string): Promise<string | null> {
    const apiKey = process.env.SHORTLINK_API_KEY;

    if (!apiKey) {
        console.warn("SHORTLINK_API_KEY missing");
        return url;
    }

    // Helper to call API
    const callApi = async (body: any) => {
        try {
            const response = await fetch("https://ze4.me/api/shortlinks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Shortlink API error:", response.status, text);
                return null;
            }

            const data = await response.json();
            console.log("ze4.me response:", JSON.stringify(data));

            // Prioritize specific fields based on user feedback
            if (data.url && typeof data.url === 'string') return data.url;
            if (data.shortUrl && typeof data.shortUrl === 'string') return data.shortUrl;
            if (data.link && typeof data.link === 'string') return data.link;

            // Fallback for nested data structure
            if (data.data && data.data.link) return data.data.link;

            console.warn("Could not extract URL from ze4.me response, returning full data for debug but defaulting to null in logic");
            // If we really can't find it, don't return the whole JSON object stringified inadvertently
            return null;
        } catch (error) {
            console.error("Shortlink fetch error:", error);
            return null;
        }
    };

    // 1. Try with preferred slug first
    if (preferredSlug) {
        // Cleaning slug to be URL safe just in case
        const cleanSlug = preferredSlug.replace(/[^a-zA-Z0-9-_]/g, "-");
        const result = await callApi({ url, slug: cleanSlug });
        if (result) return result;
    }

    // 2. Fallback to random slug if custom slug failed (likely duplicate) or no slug provided
    console.log("Fallback to random slug shortlink...");
    const result = await callApi({ url });
    return result || url;
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
        let baseUrl = process.env.PUBLIC_SITE_URL;

        // Clean up base URL (remove comments, spaces, trailing slashes)
        if (baseUrl) {
            baseUrl = baseUrl.split('#')[0].trim().replace(/\/$/, "");
        }

        if (!baseUrl) {
            baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
        }

        const inviteUrl = `${baseUrl}/?guest=${guest.slug}`;

        // Generate shortlink
        // We prioritize using the guest's slug for a pretty URL
        const shortlink = await createShortlink(inviteUrl, guest.slug);

        console.log(`Generated shortlink for ${guest.name}: ${shortlink}`);

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
