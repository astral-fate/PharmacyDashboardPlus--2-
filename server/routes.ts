import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { medicines, pharmacies, inventory, users } from "db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Medicines endpoints
  app.get("/api/medicines", async (req, res) => {
    try {
      const allMedicines = await db.select().from(medicines);
      res.json(allMedicines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medicines" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    try {
      const [newMedicine] = await db.insert(medicines).values(req.body).returning();
      res.json(newMedicine);
    } catch (error) {
      res.status(500).json({ error: "Failed to create medicine" });
    }
  });

  // Pharmacies endpoints
  app.get("/api/pharmacies", async (req, res) => {
    try {
      const allPharmacies = await db.select().from(pharmacies);
      res.json(allPharmacies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pharmacies" });
    }
  });

  app.post("/api/pharmacies", async (req, res) => {
    try {
      const [newPharmacy] = await db.insert(pharmacies).values(req.body).returning();
      res.json(newPharmacy);
    } catch (error) {
      res.status(500).json({ error: "Failed to create pharmacy" });
    }
  });

  // Inventory endpoints
  app.get("/api/inventory", async (req, res) => {
    try {
      const allInventory = await db.select().from(inventory);
      res.json(allInventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const [newInventory] = await db.insert(inventory).values(req.body).returning();
      res.json(newInventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });

  // Users endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
}
