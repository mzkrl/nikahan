import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import axios from "axios";
import session from "express-session";
import MemoryStore from "memorystore";

const API_KEY = "nCSthEqZ1hMo8ivkjF2ugQWUsgW0YDuTdIcz9UgFkGE";
const SHORTLINK_API = "https://ze4.me/api/shortlinks";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
  }
}

// Admin authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  const MemStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.ADMIN || "default-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      store: new MemStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Public API Routes
  app.get(api.guests.list.path, async (req, res) => {
    const guests = await storage.getGuests();
    res.json(guests);
  });

  app.get(api.guests.getBySlug.path, async (req, res) => {
    const slug = String(req.params.slug);
    const guest = await storage.getGuestBySlug(slug);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    res.json(guest);
  });

  app.patch(api.guests.update.path, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
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

  // Admin Routes
  app.post(api.admin.login.path, (req, res) => {
    try {
      const { password } = api.admin.login.input.parse(req.body);
      const adminPassword = process.env.ADMIN;

      if (!adminPassword) {
        return res.status(500).json({ message: "Admin password not configured" });
      }

      if (password === adminPassword) {
        req.session.isAdmin = true;
        return res.json({ success: true });
      }

      return res.status(401).json({ message: "Invalid password" });
    } catch (err) {
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.admin.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get(api.admin.checkAuth.path, (req, res) => {
    res.json({ authenticated: !!req.session?.isAdmin });
  });

  app.get(api.admin.stats.path, requireAdmin, async (req, res) => {
    const guests = await storage.getGuests();
    const stats = {
      total: guests.length,
      present: guests.filter(g => g.attendanceStatus === "present").length,
      absent: guests.filter(g => g.attendanceStatus === "absent").length,
      pending: guests.filter(g => g.attendanceStatus === "pending").length,
      guests,
    };
    res.json(stats);
  });

  app.post(api.admin.createGuest.path, requireAdmin, async (req, res) => {
    try {
      const { name, phone } = api.admin.createGuest.input.parse(req.body);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const guest = await storage.createGuest({
        name,
        slug,
        phone: phone || null,
        attendanceStatus: "pending",
      });
      
      res.json(guest);
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

  app.patch(api.admin.updateGuest.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const updates = api.admin.updateGuest.input.parse(req.body);
      
      const existing = await storage.getGuest(id);
      if (!existing) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
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

  app.delete(api.admin.deleteGuest.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const deleted = await storage.deleteGuest(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.admin.createShortlink.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const guest = await storage.getGuest(id);
      
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Get the app URL - use request host for Vercel compatibility
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const appUrl = `${protocol}://${host}`;

      try {
        await axios.post(SHORTLINK_API, {
          url: `${appUrl}/?guest=${guest.slug}`,
          slug: guest.slug
        }, {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
          }
        });
        
        const shortlink = `https://ze4.me/${guest.slug}`;
        await storage.updateGuest(id, { shortlink });
        
        res.json({ shortlink });
      } catch (error: any) {
        // If shortlink already exists (409 conflict), just use the existing one
        if (error?.response?.status === 409) {
          const shortlink = `https://ze4.me/${guest.slug}`;
          await storage.updateGuest(id, { shortlink });
          res.json({ shortlink });
        } else if (error?.response?.status === 429) {
          return res.status(429).json({ message: "Rate limit exceeded. Please wait before creating more shortlinks." });
        } else {
          console.error("Failed to create shortlink:", error?.response?.data || error?.message);
          return res.status(500).json({ message: "Failed to create shortlink" });
        }
      }
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
