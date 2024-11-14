import { pgTable, text, integer, decimal, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("staff"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const locations = pgTable("locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicineCategories = pgTable("medicine_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicines = pgTable("medicines", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => medicineCategories.id),
  description: text("description"),
  price: decimal("price").notNull(),
  manufacturer: text("manufacturer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pharmacies = pgTable("pharmacies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  locationId: integer("location_id").references(() => locations.id),
  phone: text("phone").notNull(),
  email: text("email"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerSupport = pgTable("customer_support", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
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

// Schemas for type inference and validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertLocationSchema = createInsertSchema(locations);
export const selectLocationSchema = createSelectSchema(locations);
export type Location = z.infer<typeof selectLocationSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export const insertMedicineCategorySchema = createInsertSchema(medicineCategories);
export const selectMedicineCategorySchema = createSelectSchema(medicineCategories);
export type MedicineCategory = z.infer<typeof selectMedicineCategorySchema>;
export type InsertMedicineCategory = z.infer<typeof insertMedicineCategorySchema>;

export const insertMedicineSchema = createInsertSchema(medicines);
export const selectMedicineSchema = createSelectSchema(medicines);
export type Medicine = z.infer<typeof selectMedicineSchema>;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;

export const insertPharmacySchema = createInsertSchema(pharmacies);
export const selectPharmacySchema = createSelectSchema(pharmacies);
export type Pharmacy = z.infer<typeof selectPharmacySchema>;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;

export const insertCustomerSupportSchema = createInsertSchema(customerSupport);
export const selectCustomerSupportSchema = createSelectSchema(customerSupport);
export type CustomerSupport = z.infer<typeof selectCustomerSupportSchema>;
export type InsertCustomerSupport = z.infer<typeof insertCustomerSupportSchema>;

export const insertInventorySchema = createInsertSchema(inventory);
export const selectInventorySchema = createSelectSchema(inventory);
export type Inventory = z.infer<typeof selectInventorySchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
