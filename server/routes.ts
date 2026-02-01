import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import axios from "axios";

const GUEST_LIST = [
  "AFDA ANDIKA KAYDE RUKAWA", "AHMAD AIDUL QAMIL", "AHMAD FAUZAN", "ALAN SUROTO AMARTYA",
  "ALFAREDZI DINOVA", "ALFATIHA GALUH", "ANGGATRA SATYA PUTRA NUGROHO", "ANSELMUS KARTONO BANGGUR",
  "APRILIA INTANI", "DAVINA ANANDIA", "DELVINO BERNARDO ABELARD PASARIBU", "DENENDRA RAHADYAN DANARDI",
  "DIMAS SAKTIAWAN", "ENRIQOE VAZQUEZ", "ERGA PIERO", "EVI VANI RONA ULI SIRAIT",
  "FAREL AGUSTINUS SILALAHI", "GIANDRA VALENTINO SUAJI ERWANTO", "GRACE MARIN SITANGGANG", "HAIKAL IDRIS",
  "HIKAM ZIDAN RAMADHAN", "HOSHI UKASYAH ALUWIH", "IRSYAD RAMADHAN ABIDIN", "JUANG DANOVADIL FAOMASI ZEBUA",
  "MIKAEL FEBRIAN", "MUFID PERDANA", "MUHAMMAD DWIMI HANIF AL GHIFARI", "MUHAMMAD GILANG ARRASYID",
  "MUHAMMAD RAFFI FARDAN AL AFFAN", "MUHAMMAD ROMAN KHAIRUL AZZAM", "RAUF WILDAN SANJAYA",
  "RAY ALLAND MOURICE LUMOPA", "RIZKI ABDILLAH BAHRI", "RIZKY DAWAM NURRAHMAN",
  "RIZKY FADHLURRAHMAN RAMADHAN", "SULTAN HARUNSYAH PUTERA ANDJALI", "ZUFAR RAFID IRAWAN"
];

const API_KEY = "nCSthEqZ1hMo8ivkjF2ugQWUsgW0YDuTdIcz9UgFkGE";
const SHORTLINK_API = "https://ze4.me/api/shortlinks";

async function seedGuests() {
  const existingGuests = await storage.getGuests();
  if (existingGuests.length > 0) return;

  console.log("Seeding guests...");
  const appUrl = `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_USER}.replit.dev`;

  for (const name of GUEST_LIST) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let shortlink = "";

    try {
      // Create shortlink
      const response = await axios.post(SHORTLINK_API, {
        url: `${appUrl}/?guest=${slug}`,
        slug: slug
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY
        }
      });
      
      // Assuming the API returns the created shortlink or we construct it
      shortlink = `ze4.me/${slug}`; 
      console.log(`Created shortlink for ${name}: ${shortlink}`);
    } catch (error) {
      console.error(`Failed to create shortlink for ${name}:`, error instanceof Error ? error.message : String(error));
      // Fallback if API fails, still create guest
      shortlink = `ze4.me/${slug} (failed to register)`;
    }

    await storage.createGuest({
      name,
      slug,
      shortlink,
      attendanceStatus: "pending"
    });
  }
  console.log("Seeding complete.");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seeding
  seedGuests().catch(console.error);

  // API Routes
  app.get(api.guests.list.path, async (req, res) => {
    const guests = await storage.getGuests();
    res.json(guests);
  });

  app.get(api.guests.getBySlug.path, async (req, res) => {
    const guest = await storage.getGuestBySlug(req.params.slug);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    res.json(guest);
  });

  app.patch(api.guests.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = api.guests.update.input.parse(req.body);
      const updatedGuest = await storage.updateGuest(id, updates);
      res.json(updatedGuest);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
