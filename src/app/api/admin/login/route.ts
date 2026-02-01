import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        const adminPassword = process.env.ADMIN;

        if (!adminPassword) {
            return NextResponse.json({ message: "Admin not configured" }, { status: 500 });
        }

        if (password === adminPassword) {
            const cookieStore = await cookies();

            // Set admin session cookie
            cookieStore.set("admin_session", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24, // 24 hours
                path: "/",
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
}
