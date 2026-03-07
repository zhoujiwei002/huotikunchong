import { pgTable, serial, timestamp, varchar, integer, text, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 昆虫品种表
export const insects = pgTable("insects", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  species: varchar("species", { length: 128 }),
  price: integer("price").notNull().default(0),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  index("insects_name_idx").on(table.name),
])

// 库存表
export const inventory = pgTable("inventory", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  insectId: varchar("insect_id", { length: 36 }).notNull().references(() => insects.id),
  quantity: integer("quantity").notNull().default(0),
  location: varchar("location", { length: 50 }).notNull().default("公司总部"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  index("inventory_insect_id_idx").on(table.insectId),
  index("inventory_location_idx").on(table.location),
])

// 操作记录表
export const inventoryLogs = pgTable("inventory_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  insectId: varchar("insect_id", { length: 36 }).notNull().references(() => insects.id),
  operationType: varchar("operation_type", { length: 20 }).notNull(), // 进货/销售/死亡/添加
  quantity: integer("quantity").notNull(),
  location: varchar("location", { length: 50 }).notNull().default("公司总部"),
  price: integer("price"), // 实收价格（销售时填写）
  remark: text("remark"),
  imageUrl: text("image_url"),
  operator: varchar("operator", { length: 50 }).default("未知用户"), // 操作员
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("inventory_logs_insect_id_idx").on(table.insectId),
  index("inventory_logs_operation_type_idx").on(table.operationType),
  index("inventory_logs_created_at_idx").on(table.createdAt),
])

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
})

export const insertInsectSchema = createCoercedInsertSchema(insects).pick({
  name: true,
  species: true,
  price: true,
  description: true,
})

export const updateInsectSchema = createCoercedInsertSchema(insects)
  .pick({
    name: true,
    species: true,
    price: true,
    description: true,
  })
  .partial()

export const insertInventorySchema = createCoercedInsertSchema(inventory).pick({
  insectId: true,
  quantity: true,
  location: true,
})

export const updateInventorySchema = createCoercedInsertSchema(inventory)
  .pick({
    quantity: true,
    location: true,
  })
  .partial()

export const insertInventoryLogSchema = createCoercedInsertSchema(inventoryLogs).pick({
  insectId: true,
  operationType: true,
  quantity: true,
  location: true,
  price: true,
  remark: true,
  imageUrl: true,
  operator: true,
})

// TypeScript types
export type Insect = typeof insects.$inferSelect
export type InsertInsect = z.infer<typeof insertInsectSchema>
export type UpdateInsect = z.infer<typeof updateInsectSchema>

export type Inventory = typeof inventory.$inferSelect
export type InsertInventory = z.infer<typeof insertInventorySchema>
export type UpdateInventory = z.infer<typeof updateInventorySchema>

export type InventoryLog = typeof inventoryLogs.$inferSelect
export type InsertInventoryLog = z.infer<typeof insertInventoryLogSchema>
