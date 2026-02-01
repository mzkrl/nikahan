
import { db } from "../server/db";
import { guests } from "../shared/schema";
import { sql } from "drizzle-orm";

const names = [
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

function generateSlug(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function seed() {
    console.log("🌱 Starting seed...");

    for (const name of names) {
        const slug = generateSlug(name);
        try {
            await db.insert(guests).values({
                name,
                slug,
                attendanceStatus: "pending"
            }).onConflictDoUpdate({
                target: guests.slug,
                set: { name } // Just update name if slug exists to avoid error
            });
            console.log(`✅ Seeded: ${name} (${slug})`);
        } catch (error) {
            console.error(`❌ Failed to seed ${name}:`, error);
        }
    }

    console.log("✨ Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Fatal error seeding:", err);
    process.exit(1);
});
