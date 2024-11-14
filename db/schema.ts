import { pgTable, text, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const medicines = pgTable("medicines", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  manufacturer: text("manufacturer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pharmacies = pgTable("pharmacies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  medicineId: integer("medicine_id").references(() => medicines.id),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id),
  quantity: integer("quantity").notNull(),
  minQuantity: integer("min_quantity").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertMedicineSchema = createInsertSchema(medicines);
export const selectMedicineSchema = createSelectSchema(medicines);
export type Medicine = z.infer<typeof selectMedicineSchema>;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;

export const insertPharmacySchema = createInsertSchema(pharmacies);
export const selectPharmacySchema = createSelectSchema(pharmacies);
export type Pharmacy = z.infer<typeof selectPharmacySchema>;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;

export const insertInventorySchema = createInsertSchema(inventory);
export const selectInventorySchema = createSelectSchema(inventory);
export type Inventory = z.infer<typeof selectInventorySchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
