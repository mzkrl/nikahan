import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Schema definition
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

// Sample guests data
const sampleGuests = [
    { name: "John Doe", phone: "081234567890" },
    { name: "Jane Smith", phone: "081234567891" },
    { name: "Ahmad Rizky", phone: "081234567892" },
    { name: "Siti Nurhaliza", phone: "081234567893" },
    { name: "Budi Santoso", phone: "081234567894" },
    { name: "Dewi Lestari", phone: "081234567895" },
    { name: "Eko Prasetyo", phone: "081234567896" },
    { name: "Fitri Handayani", phone: "081234567897" },
    { name: "Galih Pratama", phone: "081234567898" },
    { name: "Hana Wijaya", phone: "081234567899" },
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
        ssl: { rejectUnauthorized: false },
    });

    const db = drizzle(pool);

    try {
        // Create table if not exists
        console.log("📦 Creating guests table if not exists...");
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

        // Check if table already has data
        const existingGuests = await db.select().from(guests);

        if (existingGuests.length > 0) {
            console.log(`ℹ️  Table already has ${existingGuests.length} guests.`);
            console.log("Do you want to add more sample data? (existing data will be preserved)");

            // In non-interactive mode, skip adding more data
            if (process.argv.includes("--force")) {
                console.log("🔄 --force flag detected, adding sample guests...");
            } else {
                console.log("Run with --force to add sample guests anyway.");
                console.log("\n📋 Existing guests:");
                existingGuests.forEach((g, i) => {
                    console.log(`   ${i + 1}. ${g.name} (${g.slug}) - ${g.attendanceStatus}`);
                });
                await pool.end();
                return;
            }
        }

        // Insert sample guests
        console.log("🌱 Seeding sample guests...\n");

        for (const guest of sampleGuests) {
            const slug = generateSlug(guest.name);

            try {
                await db.insert(guests).values({
                    name: guest.name,
                    slug,
                    phone: guest.phone,
                    attendanceStatus: "pending",
                });
                console.log(`   ✅ Added: ${guest.name} → /?guest=${slug}`);
            } catch (error: any) {
                if (error.code === "23505") {
                    console.log(`   ⚠️  Skipped (already exists): ${guest.name}`);
                } else {
                    throw error;
                }
            }
        }

        console.log("\n✨ Seeding completed!");
        console.log("\n📋 Sample invite URLs:");
        console.log("   http://localhost:3000/?guest=john-doe");
        console.log("   http://localhost:3000/?guest=jane-smith");
        console.log("   http://localhost:3000/?guest=ahmad-rizky");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run seeder
seed();
