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

            // Debug log
            // console.log("ze4.me response:", JSON.stringify(data));

            // Correct extraction based on user log
            // Response structure: { link: { slug: "..." }, ... }
            if (data.link && data.link.slug) {
                return `https://ze4.me/${data.link.slug}`;
            }

            console.warn("Could not extract slug from ze4.me response", data);
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

        // CRITICAL: Only proceed to fallback if result is null
        // If result is valid, return it immediately to avoid creating double links
        if (result) return result;

        console.log(`Custom slug '${cleanSlug}' failed or invalid, trying random...`);
    }

    // 2. Fallback to random slug if custom slug failed
    console.log("Generating random slug shortlink...");
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
        // Use first name only for shorter URL as requested
        // Example: "Muhammad Rizky" -> "muhammad"
        const firstNameSlug = guest.name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const shortlink = await createShortlink(inviteUrl, firstNameSlug);

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
