// db/schema/service_pricings.js
import {
  pgTable,
  serial,
  integer,
  text,
  doublePrecision,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const service_pricings = pgTable("service_pricings", {
  id: serial("id").primaryKey(),
  service_id: integer("service_id").notNull(),
  pet_size: text("pet_size").notNull(),
  groomer_level: text("groomer_level").notNull(),
  mrp: doublePrecision("mrp").notNull(),
  discounted_price: doublePrecision("discounted_price").notNull(),
  status: text("status").notNull().default("Active"),
  delete: boolean("delete").notNull().default(false),
  deletedat: timestamp("deletedat", { withTimezone: true }),
  sync: boolean("sync").notNull().default(false),
  lastsync: timestamp("lastsync", { withTimezone: true }),
  createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
  updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    idx_service_pricings_service: index("idx_service_pricings_service").on(table.service_id),
  };
});
