import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Schema definition (harus match dengan db.ts)
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

// Helper function
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

// Helper to convert Title Case
function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

// REAL GUEST LIST
const guestListNames = [
    "AFDA ANDIKA KAYDE RUKAWA",
    "AHMAD AIDUL QAMIL",
    "AHMAD FAUZAN",
    "ALAN SUROTO AMARTYA",
    "ALFAREDZI DINOVA",
    "ALFATIHA GALUH",
    "ANGGATRA SATYA PUTRA NUGROHO",
    "ANSELMUS KARTONO BANGGUR",
    "APRILIA INTANI",
    "DAVINA ANANDIA",
    "DELVINO BERNARDO ABELARD PASARIBU",
    "DENENDRA RAHADYAN DANARDI",
    "DIMAS SAKTIAWAN",
    "ENRIQOE VAZQUEZ",
    "ERGA PIERO",
    "EVI VANI RONA ULI SIRAIT",
    "FAREL AGUSTINUS SILALAHI",
    "GIANDRA VALENTINO SUAJI ERWANTO",
    "GRACE MARIN SITANGGANG",
    "HAIKAL IDRIS",
    "HIKAM ZIDAN RAMADHAN",
    "HOSHI UKASYAH ALUWIH",
    "IRSYAD RAMADHAN ABIDIN",
    "JUANG DANOVADIL FAOMASI ZEBUA",
    "MIKAEL FEBRIAN",
    "MUFID PERDANA",
    "MUHAMMAD DWIMI HANIF AL GHIFARI",
    "MUHAMMAD GILANG ARRASYID",
    "MUHAMMAD RAFFI FARDAN AL AFFAN",
    "MUHAMMAD ROMAN KHAIRUL AZZAM",
    "RAUF WILDAN SANJAYA",
    "RAY ALLAND MOURICE LUMOPA",
    "RIZKI ABDILLAH BAHRI",
    "RIZKY DAWAM NURRAHMAN",
    "RIZKY FADHLURRAHMAN RAMADHAN",
    "SULTAN HARUNSYAH PUTERA ANDJALI",
    "ZUFAR RAFID IRAWAN"
];

async function seed() {
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error("❌ POSTGRES_URL environment variable is not set");
        console.log("Please set it in your .env file:");
        console.log("POSTGRES_URL=postgresql://username:password@host/database?sslmode=require");
        process.exit(1);
    }

    console.log("🔌 Connecting to database...");

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, // Penting untuk Neon DB
    });

    const db = drizzle(pool);

    try {
        console.log("🧹 Clearing existing guests (TRUNCATE)...");
        // Hapus data lama agar bersih dan sesuai list baru
        await pool.query("TRUNCATE TABLE guests RESTART IDENTITY CASCADE");

        // Periksa/Buat tabel jika belum ada (opsional, tapi bagus untuk safety)
        console.log("📦 Checking guests table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS guests (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                shortlink TEXT,
                phone TEXT,
                attendance_status TEXT DEFAULT 'pending',
                wishes TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log(`🌱 Seeding ${guestListNames.length} guests...\n`);

        for (const rawName of guestListNames) {
            const name = toTitleCase(rawName); // Ubah jadi Title Case biar cantik
            const slug = generateSlug(name);

            try {
                await db.insert(guests).values({
                    name,
                    slug,
                    attendanceStatus: "pending",
                });
                console.log(`   ✅ Added: ${name.padEnd(30)} → /?guest=${slug}`);
            } catch (error: any) {
                console.error(`   ❌ Failed to add ${name}:`, error.message);
            }
        }

        console.log("\n✨ Seeding completed successfully!");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run seeder
seed();
