import express, { type Express, type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import axios, { AxiosError } from "axios";
import crypto from "crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ============ SCHEMA (must match shared/schema.ts) ============
const guests = pgTable("guests", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortlink: text("shortlink"),
    phone: text("phone"),
    attendanceStatus: text("attendance_status").default("pending"),
    wishes: text("wishes"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ============ DATABASE ============
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 30000,
});
const db = drizzle(pool);

// ============ EXPRESS APP ============
const app: Express = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session
const MemoryStore = createMemoryStore(session);
app.use(
    session({
        secret: process.env.SESSION_SECRET || "wedding-secret-change-me",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({ checkPeriod: 86400000 }),
        cookie: {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

declare module "express-session" {
    interface SessionData {
        isAdmin: boolean;
        csrfToken: string;
    }
}

const API_KEY = process.env.SHORTLINK_API_KEY || "";
const SHORTLINK_API = "https://ze4.me/api/shortlinks";

function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

function validateCsrf(req: Request, res: Response, next: NextFunction) {
    if (req.method === "GET" || req.path === "/api/admin/login") {
        return next();
    }
    const headerToken = req.headers["x-csrf-token"] as string | undefined;
    const sessionToken = req.session?.csrfToken;
    if (!headerToken || !sessionToken || headerToken !== sessionToken) {
        return res.status(403).json({ message: "Invalid CSRF token" });
    }
    next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.session?.isAdmin) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}

// ============ PUBLIC ROUTES ============

app.get("/api/guests", async (_req, res) => {
    try {
        const result = await db.select().from(guests);
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

app.get("/api/guests/slug/:slug", async (req, res) => {
    try {
        const slug = req.params.slug as string;
        const [guest] = await db.select().from(guests).where(eq(guests.slug, slug));
        if (!guest) {
            return res.status(404).json({ message: "Guest not found" });
        }
        res.json(guest);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

app.patch("/api/guests/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        const { attendanceStatus, wishes } = req.body;

        const updateData: Record<string, unknown> = {};
        if (attendanceStatus !== undefined) updateData.attendanceStatus = attendanceStatus;
        if (wishes !== undefined) updateData.wishes = wishes;

        const [updated] = await db
            .update(guests)
            .set(updateData)
            .where(eq(guests.id, id))
            .returning();

        if (!updated) {
            return res.status(404).json({ message: "Guest not found" });
        }
        res.json(updated);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// ============ ADMIN ROUTES ============

app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN) {
        req.session.isAdmin = true;
        req.session.csrfToken = generateCsrfToken();
        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ message: "Session error" });
            }
            res.json({ success: true, csrfToken: req.session.csrfToken });
        });
    } else {
        res.status(401).json({ message: "Invalid password" });
    }
});

app.post("/api/admin/logout", requireAdmin, validateCsrf, (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get("/api/admin/check", (req, res) => {
    res.json({
        isAdmin: !!req.session?.isAdmin,
        csrfToken: req.session?.csrfToken,
    });
});

app.get("/api/admin/stats", requireAdmin, validateCsrf, async (_req, res) => {
    try {
        const allGuests = await db.select().from(guests);
        res.json({
            total: allGuests.length,
            attending: allGuests.filter((g) => g.attendanceStatus === "present").length,
            notAttending: allGuests.filter((g) => g.attendanceStatus === "absent").length,
            pending: allGuests.filter((g) => g.attendanceStatus === "pending").length,
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

app.get("/api/admin/guests", requireAdmin, validateCsrf, async (_req, res) => {
    try {
        const result = await db.select().from(guests);
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

app.post("/api/admin/guests", requireAdmin, validateCsrf, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const slug = generateSlug(name);
        const [guest] = await db.insert(guests).values({
            name,
            slug,
            phone: phone || null,
        } as any).returning();
        res.status(201).json(guest);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

app.delete("/api/admin/guests/:id", requireAdmin, validateCsrf, async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        await db.delete(guests).where(eq(guests.id, id));
        res.json({ success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

app.post("/api/admin/guests/:id/shortlink", requireAdmin, validateCsrf, async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        const [guest] = await db.select().from(guests).where(eq(guests.id, id));

        if (!guest) {
            return res.status(404).json({ message: "Guest not found" });
        }

        const appUrl = process.env.PUBLIC_SITE_URL || `https://${req.get("host")}`;
        const targetUrl = `${appUrl}/${guest.slug}`;

        const response = await axios.post(
            SHORTLINK_API,
            { url: targetUrl },
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );

        const shortUrl = response.data.data?.short_url || response.data.short_url;

        // Update guest with shortlink
        await db.update(guests).set({ shortlink: shortUrl } as any).where(eq(guests.id, id));

        res.json({ shortUrl, originalUrl: targetUrl });
    } catch (err) {
        if (err instanceof AxiosError) {
            console.error("Shortlink API error:", err.response?.data);
            return res.status(500).json({ message: "Failed to create shortlink" });
        }
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

export default app;
